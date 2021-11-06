(()=>{"use strict";var e={401:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.BufferPresentation=void 0;const i=s(440),n=s(646);class o extends i.Presentation{constructor(e,t,s){super(e),this.past_sections_to_buffer=t,this.future_sections_to_buffer=s}update_source(){for(let e=this.current_section+1,t=Math.min(this.current_section+this.future_sections_to_buffer+1,this.sections.length);e<t;++e)this.sections[e].load();for(let e=0,t=this.current_section-this.past_sections_to_buffer;e<t;++e)this.sections[e].unload()}add_section(e,t){this.sections.push(new n.BufferSection(e,t))}}t.BufferPresentation=o},646:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.BufferSection=void 0;const i=s(83);class n extends i.Section{constructor(e,t){super(e,t),this.media_source=new MediaSource,this.media_buffer=null,this.media_source.onsourceopen=e=>{let t='video/mp4; codecs="avc1.64002A"';if(!("MediaSource"in window)||!MediaSource.isTypeSupported(t))return console.error("MediaSource or mime codec not supported"),void this.media_source.endOfStream();let s=this.media_source.addSourceBuffer(t);s.onupdateend=e=>{this.media_source.endOfStream()},s.onerror=e=>{console.error("Failed to append buffer to source buffer:"),console.error(this.media_source)},s.onabort=e=>{console.error("Aborted source buffer:"),console.error(this.media_source)},this.load((()=>{null!=this.media_buffer?s.appendBuffer(this.media_buffer):s.abort()}),(()=>{s.abort()}))}}load(e=null,t=null){if(null!==this.media_buffer)return void(null!==e&&e());let s=new XMLHttpRequest;s.responseType="arraybuffer",s.onload=()=>{this.media_buffer=s.response,console.log(`Section '${this.name}' successfully loaded`),null!==e&&e()},s.onerror=()=>{console.error(`Section '${this.name}' failed to load`),null!==t&&t()},s.open("GET",this.video,!0),s.send()}unload(){this.media_buffer=null}get_src_url(){return URL.createObjectURL(this.media_source)}}t.BufferSection=n},962:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.FallbackPresentation=void 0;const i=s(440),n=s(527);class o extends i.Presentation{add_section(e,t){this.sections.push(new n.FallbackSection(e,t))}}t.FallbackPresentation=o},527:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.FallbackSection=void 0;const i=s(83);class n extends i.Section{get_src_url(){return this.video}}t.FallbackSection=n},440:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Presentation=void 0;const i=s(141),n=s(83);t.Presentation=class{constructor(e){this.button_should_pause=!0,this.current_video=1,this.sections=[],this.current_section=-1,this.previous_section=-1,this.next_section=0,this.cache_batch_size=e,this.video0=document.getElementById("video0"),this.video1=document.getElementById("video1"),this.videos_div=document.getElementById("videos-div"),this.timeline_sections=document.getElementsByClassName("timeline-element"),this.timeline_indicators=document.getElementsByClassName("timeline-indicator"),this.pause_button=document.getElementById("pause"),this.normal_legend=document.getElementById("normal-legend"),this.skip_legend=document.getElementById("skip-legend"),this.loop_legend=document.getElementById("loop-legend"),this.complete_loop_legend=document.getElementById("complete-loop-legend");let t=this.videos_div.dataset.project_file;(0,i.get_json)(t,(e=>{for(let t=0;t<e.length;++t){let s=this.timeline_sections[t].dataset.video;this.add_section(e[t],s)}console.log(`All ${e.length} sections have been parsed successfully.`),this.attach_timeline(),this.attach_buttons(),this.play_section(0)}))}update_video(){if(this.set_button_pause(),this.current_section==this.previous_section)return this.get_current_video().currentTime=0,void this.get_current_video().play();let e=this.sections[this.current_section],t=this.get_current_video();this.current_video=0==this.current_video?1:0;let s=this.get_current_video();switch(s.src=e.get_src_url(),s.style.visibility="visible",e.get_type()){case n.SectionType.SKIP:s.onended=e=>{++this.current_section,this.next_section=this.current_section,this.update_video()};break;case n.SectionType.LOOP:s.onended=e=>{this.update_video()};break;case n.SectionType.COMPLETE_LOOP:s.onended=e=>{this.current_section=this.next_section,this.update_video()};break;default:s.onended=e=>{}}console.log(`Playing section '${e.get_name()}'`),s.play().then((()=>{t.pause(),t.style.visibility="hidden"})),this.update_timeline(),this.update_source(),this.previous_section=this.current_section}play_section(e,t=!1){e<0||e>=this.sections.length?console.error(`Trying to switch to invalid section index #${e}`):(console.log(`Switching to section '${this.sections[e].get_name()}'`),-1==this.current_section||this.sections[this.current_section].get_type()!=n.SectionType.COMPLETE_LOOP||t?(this.next_section=e,this.current_section=e,this.update_video()):this.next_section=e)}play_next_section(){this.play_section(this.current_section+1)}restart_current_section(){this.play_section(this.current_section,!0)}play_previous_section(){this.play_section(this.current_section-1,!0)}get_current_section(){return this.current_section}get_current_video(){return 0==this.current_video?this.video0:this.video1}cache_batch(e,t){let s=e;for(let i=e,n=Math.min(e+this.cache_batch_size,this.sections.length);i<n;++i)this.sections[i].cache((()=>{++s,s==this.sections.length?(console.log(`Batch caching complete with offset ${e}`),console.log("Caching complete"),t()):s==e+this.cache_batch_size&&(console.log(`Batch caching complete with offset ${e}`),this.cache_batch(s,t))}))}cache(e){this.cache_batch(0,e)}enter_fullscreen(){console.log("Entering fullscreen."),this.videos_div.requestFullscreen?this.videos_div.requestFullscreen():this.videos_div.webkitRequestFullscreen&&this.videos_div.webkitRequestFullscreen()}exit_fullscreen(){console.log("Exiting fullscreen."),document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen&&document.webkitExitFullscreen()}fullscreen_status(){return null!=document.fullscreenElement||null!=document.webkitFullscreenElement}toggle_fullscreen(){this.fullscreen_status()?this.exit_fullscreen():this.enter_fullscreen()}attach_timeline(){for(let e=0;e<this.timeline_sections.length;++e)this.timeline_sections[e].addEventListener("click",(()=>{this.play_section(e,!0)}))}update_timeline(){if(-1!=this.previous_section&&(this.timeline_indicators[this.previous_section].innerHTML='<i class="timeline-indicators bi-check-circle" role="img"></i>'),this.timeline_indicators[this.current_section].innerHTML='<i class="timeline-indicators bi-circle-fill" role="img"></i>',this.timeline_sections[this.current_section].scrollIntoView({behavior:"smooth",block:"center"}),-1!=this.previous_section)switch(this.sections[this.previous_section].get_type()){case n.SectionType.NORMAL:this.normal_legend.classList.remove("table-active");break;case n.SectionType.SKIP:this.skip_legend.classList.remove("table-active");break;case n.SectionType.LOOP:this.loop_legend.classList.remove("table-active");break;case n.SectionType.COMPLETE_LOOP:this.complete_loop_legend.classList.remove("table-active")}switch(this.sections[this.current_section].get_type()){case n.SectionType.NORMAL:this.normal_legend.classList.add("table-active");break;case n.SectionType.SKIP:this.skip_legend.classList.add("table-active");break;case n.SectionType.LOOP:this.loop_legend.classList.add("table-active");break;case n.SectionType.COMPLETE_LOOP:this.complete_loop_legend.classList.add("table-active")}}set_button_play(){this.button_should_pause=!1,this.pause_button.innerHTML='<i class="bi-play"></i>'}set_button_pause(){this.button_should_pause=!0,this.pause_button.innerHTML='<i class="bi-pause"></i>'}pause(){console.log("Stopped."),this.get_current_video().pause(),this.set_button_play()}play(){console.log("Started."),this.get_current_video().play(),this.set_button_pause()}toggle_pause(){this.button_should_pause?this.pause():this.play()}attach_buttons(){let e=document.getElementById("previous-section"),t=document.getElementById("restart-section"),s=document.getElementById("next-section"),n=document.getElementById("pause"),o=document.getElementById("fullscreen"),c=document.getElementById("cache");e.addEventListener("click",this.play_previous_section.bind(this)),t.addEventListener("click",this.restart_current_section.bind(this)),s.addEventListener("click",this.play_next_section.bind(this)),n.addEventListener("click",this.toggle_pause.bind(this)),o.addEventListener("click",this.enter_fullscreen.bind(this)),c.addEventListener("click",(()=>{(0,i.spin_button)(c),this.cache((()=>{c.remove()}))})),this.videos_div.addEventListener("touchstart",this.play_next_section.bind(this))}update_source(){}}},83:(e,t)=>{var s;function i(e){switch(e){case"presentation.normal":return s.NORMAL;case"presentation.loop":return s.LOOP;case"presentation.skip":return s.SKIP;case"presentation.complete_loop":return s.COMPLETE_LOOP;default:return console.error(`Unsupported section type '${e}'`),s.NORMAL}}Object.defineProperty(t,"__esModule",{value:!0}),t.Section=t.get_section_type=t.SectionType=void 0,function(e){e[e.NORMAL=0]="NORMAL",e[e.LOOP=1]="LOOP",e[e.SKIP=2]="SKIP",e[e.COMPLETE_LOOP=3]="COMPLETE_LOOP"}(s=t.SectionType||(t.SectionType={})),t.get_section_type=i,t.Section=class{constructor(e,t){this.type=i(e.type),this.name=e.name,this.id=e.in_project_id,this.video=t}cache(e){let t=new XMLHttpRequest;t.onload=()=>{200==t.status||206==t.status?(console.log(`Cached section '${this.name}'`),e()):(console.error(`Section '${this.name}' failed to be cached with status ${t.status}`),window.setTimeout((()=>{this.cache(e)}),1e4))},t.onerror=()=>{console.error(`Section '${this.name}' failed to be cached`),window.setTimeout((()=>{this.cache(e)}),1e4)},t.open("GET",this.video,!0),t.send()}get_type(){return this.type}get_name(){return this.name}get_id(){return this.id}}},141:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.spin_button=t.flash=t.get_json=t.send_json=void 0,t.send_json=function(e,t,s,i=(()=>{})){let n=new XMLHttpRequest;n.onload=()=>{200==n.status?s(JSON.parse(n.responseText)):(console.error(`Failed POST to '${e}' with status ${n.status}.`),i())},n.onerror=()=>{console.error(`Failed to POST to '${e}'.`),i()},n.open("POST",e,!0),n.setRequestHeader("Content-Type","application/json;charset=UTF-8"),n.send(JSON.stringify(t))},t.get_json=function(e,t,s=(()=>{})){let i=new XMLHttpRequest;i.onload=()=>{200==i.status?t(JSON.parse(i.responseText)):(console.error(`Failed to load json '${e}' with status ${i.status}`),s())},i.onerror=()=>{console.error(`Failed to load json '${e}'`),s()},i.open("GET",e,!0),i.send()},t.flash=function(e,t){let s=document.getElementById("flashes"),i=document.createElement("div");s.appendChild(i),i.innerHTML=`<div class="alert alert-${t} alert-dismissible fade show mt-3" role="alert">\n            ${e}\n            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n         </div>`},t.spin_button=function(e){e.disabled=!0,e.innerText="";let t=document.createElement("div");e.appendChild(t),t.innerHTML='<div>\n            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\n            Loading...\n        </div>'}}},t={};function s(i){var n=t[i];if(void 0!==n)return n.exports;var o=t[i]={exports:{}};return e[i](o,o.exports,s),o.exports}(()=>{const e=s(141),t=s(401),i=s(962),n=s(141);let o=5,c=2,r=5,a=!1,l=new URLSearchParams(location.search);document.body.onload=()=>{l.has("cache_batch_size")&&(o=Number(l.get("cache_batch_size"))),l.has("past_sections_to_buffer")&&(c=Number(l.get("past_sections_to_buffer"))),l.has("future_sections_to_buffer")&&(r=Number(l.get("future_sections_to_buffer"))),l.has("use_fallback_loader")&&(a="true"===l.get("use_fallback_loader"));let s=a?(console.log(`Using FallbackPresentation with a cache batch size of ${o}.`),new i.FallbackPresentation(o)):(console.log(`Using BufferPresentation with ${r} sections to auto load, ${c} sections to keep and a cache batch size of ${o}.`),new t.BufferPresentation(o,r,c));(function(){let e=document.getElementById("cache-batch-size"),t=document.getElementById("past-sections-to-buffer"),s=document.getElementById("future-sections-to-buffer"),i=document.getElementById("fallback-loader-selected"),n=document.getElementById("update-settings");e.value=o.toString(),t.value=c.toString(),s.value=r.toString(),i.checked=a,n.addEventListener("click",(()=>{parseInt(e.value)>0&&(o=parseInt(e.value)),parseInt(t.value)>0&&(c=parseInt(t.value)),parseInt(s.value)>0&&(r=parseInt(s.value)),a=i.checked,l.set("cache_batch_size",o.toString()),l.set("past_sections_to_buffer",r.toString()),l.set("future_sections_to_buffer",c.toString()),l.set("use_fallback_loader",a.toString()),window.history.replaceState({},"",`${location.pathname}?${l.toString()}`),location.reload()}))})(),function(){let t=document.getElementById("export-presentation");if(null!==t){let s=t.dataset.target,i=t.dataset.name;t.addEventListener("click",(()=>{(0,e.spin_button)(t),(0,n.send_json)(s,{name:i},(e=>{e.success?(null==t||t.remove(),(0,n.flash)("The project has been exported, copy the project directory into a web server to serve it. More information can be found in the documentation.","success")):(0,n.flash)(`The editor unexpectedly failed to export the project '${i}' as a presentation. For more information see the console log. Please consider opening an Issue on GitHub if this problem persists.`,"danger")}))}))}}(),function(e){const t=["ArrowLeft","ArrowDown","PageDown","Backspace"],s=["ArrowRight","ArrowUp","PageUp","Enter"],i=["Space"],n=["KeyF"];document.addEventListener("keydown",(o=>{o.repeat||(t.includes(o.code)?e.play_previous_section():s.includes(o.code)?e.play_next_section():i.includes(o.code)?e.toggle_pause():n.includes(o.code)&&e.toggle_fullscreen())}))}(s)}})()})();