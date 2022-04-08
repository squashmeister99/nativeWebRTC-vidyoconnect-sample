import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useNotifications from "../hooks/useNotifications";
import useTileControls from "../hooks/useTileControls";
import ControlPanel from "./ControlPanel";
import ParticipantListMenuItem from "./ParticipantListMenuItem";
import SelectList from "./SelectList";
import {
  enableDynamicAudioSources,
  disableDynamicAudioSources,
} from "../actions/creators";
import "./Stethoscope.scss";

export default () => {
  const { isRemoteStethoscopeStarted } = useSelector(
    (state) => state.feature_stethoscope
  );
  const dispatch = useDispatch();

  useNotifications();
  useTileControls();

  useEffect(() => {
    if (isRemoteStethoscopeStarted) {
      dispatch(disableDynamicAudioSources());
    } else {
      dispatch(enableDynamicAudioSources());
    }
  }, [isRemoteStethoscopeStarted, dispatch]);

  return null;
};

export { ParticipantListMenuItem, ControlPanel, SelectList };
