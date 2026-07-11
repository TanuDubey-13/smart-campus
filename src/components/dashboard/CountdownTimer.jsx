import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const addLeadingZero = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  return (
    <div className="flex gap-3 text-center justify-start flex-wrap">
      <div className="flex flex-col p-2 bg-slate-900/60 text-white rounded-lg min-w-[50px] shadow-sm backdrop-blur-xs">
        <span className="font-black text-sm md:text-base">{addLeadingZero(timeLeft.days || 0)}</span>
        <span className="text-[8px] uppercase font-bold text-slate-350">Days</span>
      </div>
      <div className="flex flex-col p-2 bg-slate-900/60 text-white rounded-lg min-w-[50px] shadow-sm backdrop-blur-xs">
        <span className="font-black text-sm md:text-base">{addLeadingZero(timeLeft.hours || 0)}</span>
        <span className="text-[8px] uppercase font-bold text-slate-350">Hours</span>
      </div>
      <div className="flex flex-col p-2 bg-slate-900/60 text-white rounded-lg min-w-[50px] shadow-sm backdrop-blur-xs">
        <span className="font-black text-sm md:text-base">{addLeadingZero(timeLeft.minutes || 0)}</span>
        <span className="text-[8px] uppercase font-bold text-slate-350">Mins</span>
      </div>
      <div className="flex flex-col p-2 bg-slate-900/60 text-white rounded-lg min-w-[50px] shadow-sm backdrop-blur-xs">
        <span className="font-black text-sm md:text-base">{addLeadingZero(timeLeft.seconds || 0)}</span>
        <span className="text-[8px] uppercase font-bold text-slate-350">Secs</span>
      </div>
    </div>
  );
}
