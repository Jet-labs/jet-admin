import { Link } from "react-router-dom";
import PrivacyPolicy from "../../components/ui/privacyPolicy";
import logo from "../../../assets/logo.png";
const LegalPage = () => {
  return (
    <div className="w-screen items-center justify-start flex flex-col">
      <div class="flex flex-row items-center justify-start max-w-2xl p-4">
        <Link to={"/"} class="flex ms-2">
          <img src={logo} width={40} height={40}></img>
          <span class="ml-2 self-center text-xl font-bold whitespace-nowrap text-slate-800">
            Jet Forms
          </span>
        </Link>
      </div>
      <PrivacyPolicy />
    </div>
  );
};

export default LegalPage;
