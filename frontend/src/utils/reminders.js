export function localDay(now=new Date()) {return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function dueReminders(reminders,now,seen) {
  const date=localDay(now),time=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return (reminders||[]).filter(r=>{
    const key=`${r._id}:${r.date}:${r.time}`;
    if(r.date!==date||r.time!==time||seen.has(key))return false;
    seen.add(key);return true;
  });
}
