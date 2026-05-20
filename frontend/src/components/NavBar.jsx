import './NavBar.css';
import { Link } from 'react-router-dom';

function NavBar() {

    return (
        <div>
            <Link to="/">History</Link>
            <Link to="/chart">Chart</Link>
        </div>
    );
}

export default NavBar;