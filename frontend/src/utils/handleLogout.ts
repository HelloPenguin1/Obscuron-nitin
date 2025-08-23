import toast from "react-hot-toast";

const handleLogout = () => {
    localStorage.setItem("token", "");
    toast.success("Logged out from Obscuron"); 
}

export default handleLogout;