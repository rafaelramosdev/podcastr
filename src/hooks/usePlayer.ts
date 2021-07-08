import { useContext } from "react"
import { PlayerContext } from "../contexts/PlayerContext"

export const usePlayer = () => {
  return useContext(PlayerContext);
}