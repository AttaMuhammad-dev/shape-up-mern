// One player is shared by previews, tests and scheduled alerts. Selecting a
// library sound persists its ID; no arbitrary external URL is accepted.
export const SOUND_LIBRARY = [
  {id:'classic',name:'Classic Alarm',url:'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3'},
  {id:'digital',name:'Digital Beep',url:'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'},
  {id:'nature',name:'Morning Birds',url:'https://assets.mixkit.co/active_storage/sfx/139/139-preview.mp3'},
  {id:'scifi',name:'Sci-Fi Alert',url:'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3'},
  {id:'gentle',name:'Gentle Chime',url:'https://assets.mixkit.co/active_storage/sfx/1020/1020-preview.mp3'},
];
const key='shape-reminder-sound-id';
export function createReminderAudio({makeAudio=()=>new Audio(),storage=()=>window.localStorage,timer=setTimeout,untimer=clearTimeout}={}) {
  let audio,deadline,generation=0;
  let state={selectedId:'classic',playingId:null,kind:null,blocked:false,error:null,unlocked:false};
  const listeners=new Set();
  const read=(name)=>{try{return storage().getItem(name);}catch{return null;}};
  const selected=()=>SOUND_LIBRARY.find(sound=>sound.id===read(key)) || SOUND_LIBRARY[0];
  const notify=(patch)=>{state={...state,selectedId:selected().id,...patch};listeners.forEach(fn=>fn({...state}));};
  const stop=()=>{
    generation++;
    if(deadline)untimer(deadline);deadline=null;
    if(audio){audio.onended=null;audio.onerror=null;audio.loop=false;audio.pause();try{audio.currentTime=0;}catch{}}
    notify({playingId:null,kind:null,blocked:false,error:null});
  };
  const play=async({soundId=selected().id,repeats=3,persistent=false,kind='reminder'}={})=>{
    if(kind==='daily' && state.kind==='reminder')return false;
    stop();
    const sequence=generation;
    const sound=SOUND_LIBRARY.find(s=>s.id===soundId)||selected();
    let remaining=Number.isInteger(repeats)?Math.min(3,Math.max(1,repeats)):3;
    try{audio=audio||makeAudio();}catch{notify({error:'Audio is unavailable in this browser.'});return false;}
    audio.src=sound.url;audio.preload='auto';audio.volume=1;audio.loop=persistent;
    const failed=(error)=>{
      if(sequence!==generation)return;
      stop();
      notify({blocked:error?.name==='NotAllowedError',...(error?.name==='NotAllowedError'?{unlocked:false}:{}),error:error?.name==='NotAllowedError'?'Tap Play sound to allow audio in this browser.':'The selected sound could not load. Check your connection and try again.'});
    };
    const start=async()=>{
      if(sequence!==generation)return false;
      try{await audio.play();if(sequence!==generation)return false;notify({playingId:sound.id,kind,blocked:false,error:null,unlocked:true});return true;}
      catch(error){failed(error);return false;}
    };
    audio.onerror=()=>failed(new Error('Media unavailable'));
    audio.onended=()=>{
      if(sequence!==generation||persistent)return;
      remaining--;
      if(remaining>0){audio.currentTime=0;void start();}else stop();
    };
    // Bounded repeat even if a provider file is unusually long or an ended
    // event never arrives. Persistent high-priority alerts stop after 2 min.
    deadline=timer(()=>{if(sequence===generation)stop();},persistent?120000:60000);
    return start();
  };
  return {
    play,stop,selected,
    snapshot:()=>({...state,selectedId:selected().id}),
    subscribe(fn){listeners.add(fn);fn({...state,selectedId:selected().id});return()=>listeners.delete(fn);},
    select(id){if(!SOUND_LIBRARY.some(s=>s.id===id))return false;try{storage().setItem(key,id);}catch{return false;}notify({});return true;},
    enabled:()=>read('shape-reminder-sound')!=='false',
  };
}
export const reminderAudio=createReminderAudio();
