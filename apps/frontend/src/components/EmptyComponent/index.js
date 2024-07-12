import "./styles.css";
import empty_svg from "../../assets/empty_svg.svg";
export const EmptyComponent = ({}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full p-20">
      <img
        src={empty_svg}
        height={100}
        width={100}
        className="opacity-50"
      ></img>
      <span className="text-base font-semibold mt-3 text-gray-400">
        No records found
      </span>
    </div>
  );
};
