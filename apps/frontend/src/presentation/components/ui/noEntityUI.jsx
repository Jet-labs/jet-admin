export const NoEntityUI = ({ message }) => {
  return (
    <div className=" bg-[#f8f8ff] p-5 w-full rounded flex justify-center items-center">
      <span className="!text-[#646cffaf] text-sm font-semibold text-center w-full">
        {message}
      </span>
    </div>
  );
};
