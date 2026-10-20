import React from 'react';
import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import SupportChatbot from '../SupportChatbot';
jest.mock('axios',()=>({post:jest.fn(),isCancel:()=>false}));
const mount=()=>{render(<Provider store={configureMockStore()({auth:{userInfo:null}})}><SupportChatbot/></Provider>);fireEvent.click(screen.getByRole('button',{name:'Open Shape Up AI chat'}));};
const send=text=>{fireEvent.change(screen.getByRole('textbox',{name:'Ask Shape Up AI'}),{target:{value:text}});fireEvent.click(screen.getByRole('button',{name:'Send message to Shape Up AI'}));};
beforeEach(()=>jest.clearAllMocks());
test('passes previous turns as bounded follow-up context',async()=>{
  axios.post.mockResolvedValue({data:{reply:'Try wall push-ups.'}});mount();send('Suggest a beginner workout');
  await screen.findByText('Try wall push-ups.');send('How many repetitions?');
  await waitFor(()=>expect(axios.post).toHaveBeenCalledTimes(2));
  const context=axios.post.mock.calls[1][1].history;
  expect(context).toEqual([{role:'user',text:'Suggest a beginner workout'},{role:'model',text:'Try wall push-ups.'}]);
  expect(axios.post.mock.calls[1][2].timeout).toBe(26000);
});
test('shows the API failure reply without a fabricated success',async()=>{
  axios.post.mockRejectedValue({response:{data:{reply:'The AI service/API is at its usage limit.'}}});mount();send('Suggest a workout');
  expect(await screen.findByText('The AI service/API is at its usage limit.')).toBeInTheDocument();
});
test('rapid Enter presses submit only one request',async()=>{
  let resolve;axios.post.mockImplementation(()=>new Promise(r=>{resolve=r;}));mount();
  const box=screen.getByRole('textbox',{name:'Ask Shape Up AI'});fireEvent.change(box,{target:{value:'A workout please'}});
  fireEvent.keyDown(box,{key:'Enter'});fireEvent.keyDown(box,{key:'Enter'});expect(axios.post).toHaveBeenCalledTimes(1);
  await act(async()=>resolve({data:{reply:'A complete reply.'}}));expect(await screen.findByText('A complete reply.')).toBeInTheDocument();
});
