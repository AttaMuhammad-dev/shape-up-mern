import {vi} from 'vitest';
import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import StepTracker from '../StepTracker';
afterEach(()=>vi.unstubAllGlobals());
test('pausing motion preserves unsaved steps instead of restoring the server count',async()=>{
 vi.stubGlobal('DeviceMotionEvent',class{});
 render(<StepTracker currentSteps={100} onSave={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'Start',exact:true}));
 const motion=new Event('devicemotion');Object.defineProperty(motion,'accelerationIncludingGravity',{value:{x:20,y:0,z:0}});
 fireEvent(window,motion);
 expect(screen.getByRole('spinbutton',{name:'Steps today'})).toHaveValue(101);
 fireEvent.click(screen.getByRole('button',{name:'Stop',exact:true}));
 expect(screen.getByRole('spinbutton',{name:'Steps today'})).toHaveValue(101);
});
test('manual steps are saved to the account and reset stays unsaved until saved',async()=>{
 const save=vi.fn().mockResolvedValue(undefined);
 render(<StepTracker currentSteps={100} onSave={save}/>);
 fireEvent.change(screen.getByRole('spinbutton',{name:'Steps today'}),{target:{value:'4500'}});
 fireEvent.click(screen.getByRole('button',{name:'Save steps to your account'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith(4500));
 fireEvent.click(screen.getByRole('button',{name:'Reset unsaved steps'}));
 expect(screen.getByRole('spinbutton',{name:'Steps today'})).toHaveValue(0);
 expect(save).toHaveBeenCalledTimes(1);
});
