import NavBarItem from "./NavBarItem";

export default function NavBar() {
    return (
        <nav className="max-w-3xl">
            <div className="flex flex-row justify-center items-center mt-2 mx-4 bg-alt w-full rounded-3xl">
                <NavBarItem text="button" />
                <NavBarItem text="checkbox" />
                <NavBarItem text="input" />
                <NavBarItem text="slider" />
                <NavBarItem text="tooltip" />
            </div>
        </nav>
    );
}
