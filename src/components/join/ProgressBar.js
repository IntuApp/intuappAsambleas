const ProgressBar = ({ currentStep, totalSteps = 7 }) => (
  <div className="w-full h-2 bg-[#F3F6F9] rounded-full overflow-hidden">
    <div
      className="h-full bg-[#D5DAFF] transition-all duration-500 ease-out"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
);

export default ProgressBar;