import { UserCircle as UserIcon } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { NavLink, Outlet } from "react-router";

type Props = {};

function Nav({}: Props) {
    return (
        <>
            <nav className="">
                <div className="max-w-7xl w-full mx-auto p-4 flex items-center justify-between">
                    <NavLink to="/">
                        <img src="/img/logo.png" alt="MovieZone Logo" className="h-10" />
                    </NavLink>

                    <div className="flex items-center gap-6 text-white">
                        <SearchBar />

                        <ul className="flex items-center gap-4 ">
                            <li className="">
                                <NavLink to="/movies/trending">Movies</NavLink>
                            </li>
                            <li className="">
                                <NavLink to="/tv-shows">TV Shows</NavLink>
                            </li>
                        </ul>

                        <NavLink to="/profile">
                            <UserIcon size={40} />
                        </NavLink>
                    </div>
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Nav;
