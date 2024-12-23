import React, { memo, ReactNode, useCallback, useEffect, useState } from 'react';
import './CustomDatePicker.css';

interface customDatePickerProps {
  setChoosedDate: (component: string) => void;
}

function CustomDatePicker({ setChoosedDate }: customDatePickerProps): ReactNode {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [minDate, setMinDate] = useState<string>('');

  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.type = 'text';
    const [year, month, day] = event.target.value.split('-');
    setChoosedDate(day+'/'+month+'/'+year);
    setSelectedDate(day+'/'+month+'/'+year);    
  },[setChoosedDate]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = event.currentTarget; // Access the clicked input element
    inputElement.type = 'date';
    if (inputElement.showPicker) {
      inputElement.showPicker(); // Programmatically show the picker if supported
    } 
  }, []);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear(); 
    const month = today.getMonth()+1;
    const day = today.getDate();
    const _date = day+'/'+month+'/'+year;
    setSelectedDate(_date);
    const min = new Date().toISOString().split('T')[0];
    setMinDate(min);
    setChoosedDate(_date);
  }, [setChoosedDate]);

  return (
    <div className='container'>
      <input
        type="text"
        id="date"
        className='date'
        name="date"
        value={selectedDate}
        min={minDate}
        onChange={handleDateChange}
        onClick={handleClick}
        required
      />
    </div>
  );
}

export default memo(CustomDatePicker);
