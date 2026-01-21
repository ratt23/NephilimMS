import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    return (
        <footer className="fixed bottom-[50px] left-1/2 -translate-x-1/2 w-auto h-auto bg-[#01007f]/90 backdrop-blur-md flex justify-center items-center gap-2 p-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-[100] transition-all duration-300 sm:bottom-[45px]">
            <NavLink
                to="/home"
                className={({ isActive }) => `py-2 px-4 text-[0.85rem] font-semibold rounded-full no-underline transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-white text-[#01007f] font-bold shadow-sm' : 'text-[#a9a8ff] hover:text-white hover:bg-white/10'}`}
            >
                <span>Home</span>
            </NavLink>
            <NavLink
                to="/mcu"
                className={({ isActive }) => `py-2 px-4 text-[0.85rem] font-semibold rounded-full no-underline transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-white text-[#01007f] font-bold shadow-sm' : 'text-[#a9a8ff] hover:text-white hover:bg-white/10'}`}
            >
                <span>MCU</span>
            </NavLink>
            <NavLink
                to="/homecare"
                className={({ isActive }) => `py-2 px-4 text-[0.85rem] font-semibold rounded-full no-underline transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-white text-[#01007f] font-bold shadow-sm' : 'text-[#a9a8ff] hover:text-white hover:bg-white/10'}`}
            >
                <span>Home Care</span>
            </NavLink>
        </footer>
    );
};

export default BottomNav;
