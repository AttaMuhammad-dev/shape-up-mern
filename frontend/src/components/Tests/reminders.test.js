import {dueReminders,localDay} from '../../utils/reminders';
test('a reminder fires once for its exact local day and minute',()=>{
  const now=new Date(2026,9,20,0,1),seen=new Set();const list=[{_id:'today',date:'2026-10-20',time:'00:01'},{_id:'yesterday',date:'2026-10-19',time:'00:01'},{_id:'later',date:'2026-10-20',time:'00:02'}];
  expect(localDay(now)).toBe('2026-10-20');expect(dueReminders(list,now,seen).map(r=>r._id)).toEqual(['today']);expect(dueReminders(list,now,seen)).toEqual([]);
});
