import React from 'react';import {vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';import {Provider} from 'react-redux';import configureMockStore from 'redux-mock-store';
import {ThemeProvider} from '../../context/ThemeContext';import Settings from '../../pages/Settings';import axios from 'axios';import {toast} from 'react-toastify';
vi.mock('axios',()=>({default:{post:vi.fn(),delete:vi.fn()}}));
vi.mock('react-toastify',()=>({toast:{success:vi.fn(),error:vi.fn()}}));
const mount=()=>render(<Provider store={configureMockStore()({auth:{userInfo:{_id:'owned',name:'Synthetic',email:'test@example.invalid'}}})}><MemoryRouter><ThemeProvider><Settings/></ThemeProvider></MemoryRouter></Provider>);
beforeEach(()=>{vi.clearAllMocks();window.history.replaceState({},'','/pages/settings');});
test('failed support email keeps the message and displays an error without success',async()=>{
  axios.post.mockRejectedValue({response:{data:{message:'Provider temporarily unavailable'}}});mount();fireEvent.click(screen.getByText('Support',{selector:'a'}));fireEvent.click(screen.getByText('Contact Us'));
  fireEvent.change(screen.getByLabelText('DESCRIBE YOUR ISSUE'),{target:{value:'Synthetic support message only'}});fireEvent.click(screen.getByRole('button',{name:'Send Message'}));
  await waitFor(()=>expect(toast.error).toHaveBeenCalledWith('Provider temporarily unavailable'));expect(toast.success).not.toHaveBeenCalled();expect(screen.getByLabelText('DESCRIBE YOUR ISSUE')).toHaveValue('Synthetic support message only');
});
test('permanent deletion cannot submit until the current password and exact confirmation are present',async()=>{
  mount();fireEvent.click(screen.getByText('Security',{selector:'a'}));fireEvent.click(screen.getByRole('button',{name:'Delete Account'}));const button=screen.getByRole('button',{name:'Permanently delete my account'});expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Current password'),{target:{value:'synthetic-secret'}});fireEvent.change(screen.getByLabelText('Type DELETE to confirm'),{target:{value:'delete'}});expect(button).toBeDisabled();fireEvent.change(screen.getByLabelText('Type DELETE to confirm'),{target:{value:'DELETE'}});expect(button).toBeEnabled();
  axios.delete.mockRejectedValue({response:{data:{message:'Wrong password'}}});fireEvent.click(button);await waitFor(()=>expect(toast.error).toHaveBeenCalledWith('Wrong password'));expect(axios.delete).toHaveBeenCalledWith('/api/users/profile',{data:{password:'synthetic-secret',confirmation:'DELETE'},timeout:25000});
});
