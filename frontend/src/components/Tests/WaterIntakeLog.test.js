import React from 'react';
import {render,fireEvent,screen,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import WaterIntake from '../WaterIntake';
const mockUpdate=jest.fn();
jest.mock('../../slices/usersApiSlice',()=>({useUpdateWaterIntakeMutation:()=>[mockUpdate,{isLoading:false}]}));
beforeEach(()=>{jest.clearAllMocks();global.fetch=jest.fn(async()=>({ok:true,json:async()=>({litersDrank:1.5})}));});
test('loads today’s signed-in water amount instead of stale local data',async()=>{
  localStorage.setItem('waterIntake','{broken');render(<WaterIntake/>);
  expect(await screen.findByText('Water logged today: 1.5 litres')).toBeInTheDocument();
  expect(screen.getByLabelText(/log water consumed/i)).toHaveValue(0);
});
test('adds water only after the server saves it and resets the entry',async()=>{
  mockUpdate.mockReturnValue({unwrap:async()=>({litersDrank:3.5})});render(<WaterIntake/>);
  await screen.findByText('Water logged today: 1.5 litres');
  fireEvent.change(screen.getByLabelText(/log water consumed/i),{target:{value:'2'}});fireEvent.click(screen.getByRole('button',{name:'Add'}));
  await waitFor(()=>expect(mockUpdate).toHaveBeenCalledWith({litersDrank:3.5}));
  expect(await screen.findByText('Water logged today: 3.5 litres')).toBeInTheDocument();
  expect(screen.getByLabelText(/log water consumed/i)).toHaveValue(0);
});
test('a rejected save does not display an unsaved amount',async()=>{
  mockUpdate.mockReturnValue({unwrap:async()=>{throw new Error('API unavailable');}});render(<WaterIntake/>);
  await screen.findByText('Water logged today: 1.5 litres');
  fireEvent.change(screen.getByLabelText(/log water consumed/i),{target:{value:'2'}});fireEvent.click(screen.getByRole('button',{name:'Add'}));
  await waitFor(()=>expect(mockUpdate).toHaveBeenCalled());expect(screen.getByText('Water logged today: 1.5 litres')).toBeInTheDocument();
});
