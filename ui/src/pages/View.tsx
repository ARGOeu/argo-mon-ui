import { StatusItem } from "../components/StatusItem"

export const View = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold">View</h1>
      <StatusItem name="test" status="OK" alias="Test Infrastructure"/>
    </div>
  )
}
