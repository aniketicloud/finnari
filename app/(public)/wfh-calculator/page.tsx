import { WfhCalculatorForm } from "./_components/wfh-calculator-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-md lg:max-w-4xl">
        <WfhCalculatorForm />
      </div>
    </div>
  )
}
