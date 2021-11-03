import { spin_button, get_json } from "../utils";
import { Section, SectionJson, SectionType } from "./section";

export abstract class Presentation {
    // using two video elements for smooth transitions
    private video0: HTMLVideoElement;
    private video1: HTMLVideoElement;
    private videos_div: HTMLDivElement;
    private timeline_sections: HTMLCollectionOf<HTMLDivElement>;
    private timeline_indicators: HTMLCollectionOf<HTMLElement>;
    private pause_button: HTMLButtonElement;

    // switch between play and pause
    private button_should_pause = true;

    private cache_batch_size: number;
    // gets flipped when displaying first video
    private current_video = 1;

    protected sections: Section[] = [];
    protected current_section = -1;
    // used for restarting loops
    // <- has to be done to allow complete loops
    private previous_section = -1;
    // used for complete loops
    private next_section = 0;

    public constructor(cache_batch_size: number) {
        this.cache_batch_size = cache_batch_size;

        this.video0 = document.getElementById("video0") as HTMLVideoElement;
        this.video1 = document.getElementById("video1") as HTMLVideoElement;
        this.videos_div = document.getElementById("videos-div") as HTMLDivElement;
        this.timeline_sections = document.getElementsByClassName("timeline-element") as HTMLCollectionOf<HTMLDivElement>;
        this.timeline_indicators = document.getElementsByClassName("timeline-indicator") as HTMLCollectionOf<HTMLDivElement>;
        this.pause_button = document.getElementById("pause") as HTMLButtonElement;

        // load_sections
        let project_file = this.videos_div.dataset.project_file as string;
        get_json(project_file, (sections: SectionJson[]) => {
            // construct sections from json response
            for (let i = 0; i < sections.length; ++i) {
                // custom Flask url
                let video = this.timeline_sections[i].dataset.video as string;
                this.add_section(sections[i], video);
            }
            console.log(`All ${sections.length} sections have been parsed successfully.`)

            this.attach_timeline();
            this.attach_buttons();
            // start the action
            this.play_section(0);
        });
    }

    // update currently playing video in html video element
    private update_video(): void {
        this.set_button_pause();
        // correct section already current
        if (this.current_section == this.previous_section) {
            // restart video
            this.get_current_video().currentTime = 0;
            this.get_current_video().play();
            return;
        }
        let current_section_elem = this.sections[this.current_section];
        // swap videos
        let last_element = this.get_current_video();
        this.current_video = this.current_video == 0 ? 1 : 0;
        let next_element = this.get_current_video();

        // double buffering: setup new video
        next_element.src = current_section_elem.get_src_url();
        next_element.style.visibility = "visible";

        // set callback for when video has ended
        switch (current_section_elem.get_type()) {
            case SectionType.SKIP:
                next_element.onended = (_) => {
                    // immediately go to next section without user input
                    ++this.current_section;
                    this.next_section = this.current_section;
                    this.update_video();
                }
                break;
            case SectionType.LOOP:
                next_element.onended = (_) => {
                    // restart from beginning
                    this.update_video();
                }
                break;
            case SectionType.COMPLETE_LOOP:
                next_element.onended = (_) => {
                    // when next section has changed, go to next one
                    // otherwise restart
                    this.current_section = this.next_section;
                    this.update_video();
                }
                break;
            // SectionType.NORMAL
            default:
                // do nothing <- wait for user input
                next_element.onended = (_) => { }
                break;
        }

        console.log(`Playing section '${current_section_elem.get_name()}'`)
        // hide old video once new one plays
        next_element.play().then(() => {
            // pause old video to not call onended callback again when that video ends in background
            last_element.pause();
            last_element.style.visibility = "hidden";
        });

        this.update_timeline()
        this.update_source();

        // everything done -> section has changed
        this.previous_section = this.current_section;
    }

    // skip_complete_loop can be used in the timeline or as a forced continue
    public play_section(section: number, skip_complete_loop = false): void {
        if (section < 0 || section >= this.sections.length) {
            console.error(`Trying to switch to invalid section index #${section}`)
            return;
        }
        console.log(`Switching to section '${this.sections[section].get_name()}'`)

        if (this.current_section != -1 && this.sections[this.current_section].get_type() == SectionType.COMPLETE_LOOP && !skip_complete_loop) {
            // if current section is complete loop, wait until section finishes
            this.next_section = section;
        } else {
            // instantly switch the video
            this.next_section = section;
            this.current_section = section;
            this.update_video();
        }
    }

    public play_next_section(): void {
        this.play_section(this.current_section + 1);
    }

    public restart_current_section(): void {
        this.play_section(this.current_section, true);
    }

    public play_previous_section(): void {
        // don't finish complete loops when going back
        this.play_section(this.current_section - 1, true);
    }

    public get_current_section(): number { return this.current_section; }

    private get_current_video(): HTMLVideoElement {
        if (this.current_video == 0)
            return this.video0;
        else
            return this.video1;
    }

    /////////////
    // caching //
    /////////////
    // asynchronous, recursive; downloads everything after offset in batches
    private cache_batch(offset: number, on_finished: { (): void; }): void {
        let finished = offset;
        // cache one whole batch
        for (let i = offset, len = Math.min(offset + this.cache_batch_size, this.sections.length); i < len; ++i)
            this.sections[i].cache(() => {
                ++finished;
                // all finished
                if (finished == this.sections.length) {
                    console.log(`Batch caching complete with offset ${offset}`)
                    console.log("Caching complete");
                    on_finished();
                }
                // start next batch
                else if (finished == offset + this.cache_batch_size) {
                    console.log(`Batch caching complete with offset ${offset}`)
                    this.cache_batch(finished, on_finished);
                }
            });
    }

    // asynchronous
    public cache(on_finished: { (): void; }): void {
        this.cache_batch(0, on_finished);
    }

    ////////////////
    // fullscreen //
    ////////////////
    // TODO: doesn't work on safari
    public enter_fullscreen(): void {
        if (this.videos_div.requestFullscreen)
            this.videos_div.requestFullscreen();
        // // safari
        // else if (this.videos_div.webkitRequestFullscreen)
        //     this.videos_div.webkitRequestFullscreen();
        // // ie11
        // else if (this.videos_div.msRequestFullscreen)
        //     this.videos_div.msRequestFullscreen();
    }

    public exit_fullscreen(): void {
        if (document.exitFullscreen)
            document.exitFullscreen();
        // // safari
        // else if (document.webkitExitFullscreen)
        //     document.webkitExitFullscreen();
        // // ie11
        // else if (document.msExitFullscreen)
        //     document.msExitFullscreen();
    }

    private fullscreen_status(): boolean {
        // return document.fullscreenElement != null ||
        //     document.webkitFullscreenElement != null ||
        //     document.mozFullScreenElement != null;
        return document.fullscreenElement != null;
    }

    public toggle_fullscreen(): void {
        if (this.fullscreen_status())
            this.exit_fullscreen();
        else
            this.enter_fullscreen();
    }

    ////////////////////
    // user interface //
    ////////////////////
    private attach_timeline(): void {
        for (let i = 0; i < this.timeline_sections.length; ++i) {
            this.timeline_sections[i].addEventListener("click", () => {
                this.play_section(i, true);
            });
        }
    }

    private update_timeline(): void {
        if (this.previous_section != -1)
            this.timeline_indicators[this.previous_section].innerHTML = `<i class="timeline-indicators bi-check-circle" role="img"></i>`;
        this.timeline_indicators[this.current_section].innerHTML = `<i class="timeline-indicators bi-circle-fill" role="img"></i>`;
        this.timeline_sections[this.current_section].scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // update icon on button
    private set_button_play(): void {
        this.button_should_pause = false;
        this.pause_button.innerHTML = '<i class="bi-play"></i>';
    }
    private set_button_pause(): void {
        this.button_should_pause = true;
        this.pause_button.innerHTML = '<i class="bi-pause"></i>';
    }

    public pause(): void {
        console.log("Stopped.");
        this.get_current_video().pause();
        this.set_button_play();
    }
    public play(): void {
        console.log("Started.");
        this.get_current_video().play();
        this.set_button_pause();
    }
    public toggle_pause(): void {
        if (this.button_should_pause)
            this.pause();
        else
            this.play();
    }

    public attach_buttons(): void {
        let previous = document.getElementById("previous-section") as HTMLButtonElement;
        let restart = document.getElementById("restart-section") as HTMLButtonElement;
        let next = document.getElementById("next-section") as HTMLButtonElement;
        let pause = document.getElementById("pause") as HTMLButtonElement;
        let fullscreen = document.getElementById("fullscreen") as HTMLButtonElement;
        let cache = document.getElementById("cache") as HTMLButtonElement;

        // add callbacks
        previous.addEventListener("click", this.play_previous_section.bind(this));
        restart.addEventListener("click", this.restart_current_section.bind(this));
        next.addEventListener("click", this.play_next_section.bind(this));
        pause.addEventListener("click", this.toggle_pause.bind(this));
        fullscreen.addEventListener("click", this.enter_fullscreen.bind(this));
        cache.addEventListener("click", () => {
            spin_button(cache);
            this.cache(() => {
                cache.remove();
            });
        });
    }

    ////////////////////////////////
    // to be defined by inheritor //
    ////////////////////////////////
    protected abstract add_section(section: SectionJson, video: string): void;

    // called after section changed
    // to be overwritten if required
    protected update_source(): void { }
};