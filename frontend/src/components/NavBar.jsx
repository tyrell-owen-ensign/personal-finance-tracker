import './NavBar.css';
import {NavLink} from 'react-router-dom';

function NavBar() {

    return (
        <div className="NavBar">
            <NavLink to="/"
                     className="nav-link">
                History
            </NavLink>
            <NavLink to="/chart" end className="nav-link">
                Chart
            </NavLink>
        </div>
    );
}

export default NavBar;