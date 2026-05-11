import { Search as SearchIcon } from "lucide-react";

type Props = {};

export function SearchBar({}: Props) {
    return (
        <form className="">
            <div className="flex items-center p-2 relative border-2 rounded-md border-white">
                <SearchIcon size={20} className="mr-2" />
                <input type="text" placeholder="Search ..." className="block outline-none" />
            </div>
        </form>
    );
}
