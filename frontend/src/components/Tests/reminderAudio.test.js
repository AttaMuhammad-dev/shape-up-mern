import {createReminderAudio,SOUND_LIBRARY} from '../../utils/reminderAudio';

let media,store,player;
beforeEach(()=>{
  vi.useFakeTimers();
  store=new Map();
  media={play:vi.fn().mockResolvedValue(),pause:vi.fn(),currentTime:0};
  player=createReminderAudio({makeAudio:()=>media,storage:()=>({getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)})});
});
afterEach(()=>{player.stop();vi.useRealTimers();});
test('saved library selection is used by future scheduled alerts and a new player',async()=>{
  expect(player.select('gentle')).toBe(true);
  await player.play();expect(media.src).toBe(SOUND_LIBRARY.find(s=>s.id==='gentle').url);
  const reloaded=createReminderAudio({storage:()=>({getItem:k=>store.get(k)||null})});expect(reloaded.selected().id).toBe('gentle');
});
test('normal reminder plays exactly three times then stops',async()=>{
  await player.play();await media.onended();await media.onended();expect(media.play).toHaveBeenCalledTimes(3);
  media.onended();expect(player.snapshot().playingId).toBeNull();expect(media.onended).toBeNull();
});
test('persistent alert loops and can always be stopped',async()=>{
  await player.play({persistent:true});expect(media.loop).toBe(true);player.stop();expect(media.loop).toBe(false);expect(media.pause).toHaveBeenCalled();expect(player.snapshot().playingId).toBeNull();
});
test('persistent alert has a two-minute safety deadline',async()=>{
  await player.play({persistent:true});vi.advanceTimersByTime(120000);expect(player.snapshot().playingId).toBeNull();expect(media.loop).toBe(false);
});
test('autoplay rejection is visible and a user-triggered retry can succeed',async()=>{
  const error=new Error('blocked');error.name='NotAllowedError';media.play.mockRejectedValueOnce(error);
  expect(await player.play()).toBe(false);expect(player.snapshot().blocked).toBe(true);
  expect(await player.play()).toBe(true);expect(player.snapshot().blocked).toBe(false);
});
test('unavailable media reports failure instead of switching to an unrelated beep',async()=>{
  player.select('nature');await player.play();media.onerror();expect(player.snapshot().error).toMatch(/selected sound/);expect(player.selected().id).toBe('nature');expect(media.src).toContain('/139/');
});
test('stale play promises cannot revive a dismissed or replaced alert',async()=>{
  let resolve;media.play.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));const pending=player.play();player.stop();resolve();await pending;expect(player.snapshot().playingId).toBeNull();
});
test('replacing a preview clears its old repeat handler and timer',async()=>{
  await player.play({kind:'preview',soundId:'digital'});const oldEnded=media.onended;
  await player.play({kind:'reminder',soundId:'gentle'});oldEnded();expect(media.play).toHaveBeenCalledTimes(2);expect(player.snapshot().playingId).toBe('gentle');
});
test('daily goal sound does not interrupt an active scheduled reminder',async()=>{
  await player.play({kind:'reminder'});expect(await player.play({kind:'daily',repeats:1})).toBe(false);expect(media.play).toHaveBeenCalledTimes(1);
});
test('invalid stored IDs and arbitrary URLs safely use the known default',async()=>{
  store.set('shape-reminder-sound-id','https://unrelated.invalid');expect(player.selected().id).toBe('classic');expect(player.select('invalid')).toBe(false);
  await player.play({soundId:'https://unrelated.invalid'});expect(media.src).toBe(SOUND_LIBRARY[0].url);
});
