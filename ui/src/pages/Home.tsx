import { Link } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

export const Home = () => {


  const { profile } = useAuth()


  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome
        {
          profile?.username &&
          <span>
            , <span className="text-amber-700"><Link to="/about">{profile.username}</Link></span>!
          </span>
        }
      </h1>
    </div>
  )
}
