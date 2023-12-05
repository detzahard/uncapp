import { roleToString } from "../../model/Role";
import React, { useState } from "react";
import { getStreamUrl } from "../../utils/UrlUtilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";
import { Commentary } from "../../model/Commentary";
import { ToggleBookmarkButton } from "../BookmarkToggleButton";
import { ToggleWatchStatusButton } from "../ToggleWatchStatusButton";
import { Bookmarkable } from "../../model/Bookmark";
import { Watchable } from "../../model/WatchStatus";
import Hls from "hls.js";

export interface CommentarySearchResultProps {
  commentary: Commentary;
  matchedStrings: string[];
  isBookmarked: boolean;
  isWatched: boolean;
  onToggleBookmark: (item: Bookmarkable) => void;
  onToggleWatchStatus: (item: Watchable) => void;
  isDownloadEnabled: boolean;
}

export function CommentarySearchResult(props: CommentarySearchResultProps): React.ReactElement {
  const { commentary, isDownloadEnabled } = props;
  const { role, uuid, skillCappedUrl, releaseDate, staff, champion, opponent, kills, deaths, assists, gameLengthInMinutes, carry, type,
  } = commentary;

  const buttonProps = {
    ...props,
    item: commentary,
  };

  const [showVideoOverlay, setShowVideoOverlay] = useState(false);

  const handleOpenVideoOverlay = () => {
    setShowVideoOverlay(!showVideoOverlay);

  };

  const handleCloseVideoOverlay = () => {
    setShowVideoOverlay(false);
  };

  var hls: Hls | null = null;

  if (Hls.isSupported()) {
    var hlsjsConfig = {
      "maxBufferSize": 0,
      "maxBufferLength": 30,
      "startPosition": 0
    }
    hls = new Hls(hlsjsConfig);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      document.getElementById("videop").play();
    });
  }

  const stream = async () => {
    console.log(`Called`);
    if (hls == null) {
      console.log("HLS not supported, please use a modern browser such as Chrome");
      return;
    }

    const videoId = commentary.uuid;

    console.log(`Video ID is ${videoId}`);
    console.log("Looking for the final part...");
    let last = 0;
    let jump = true;

    for (let i = 300; i <= 1000; i++) {
      if (i == 1000) {
        console.log("Error finding the last part");
        return;
      }

      if (i == 0) i = 1;

      const apiUrl = `https://d13z5uuzt1wkbz.cloudfront.net/${videoId}/HIDDEN4500-${String(i).padStart(5, "0")}.ts`; 
      const url = 'https://cors-anywhere.herokuapp.com/' + apiUrl;

      console.log(`Testing ${url}`);

      try {
        const resp = await fetch(url, { method: 'HEAD' });
        if (resp.status === 403) {
          if (i >= 50 && i % 50 === 0 && jump) {
            last = i;
            jump = true;
            i -= 51;
            continue;
          }

          break;
        }
        last = i;
        jump = false;
      } catch (e) {
        console.log("Fetch failed, please install a Cross-Origin disabler extension for your browser or check your internet connectivity.");
        return;
      }
    }

    let data = "#EXTM3U\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:10";
    for (let i = 0; i <= last; i++) {
      data += `#EXTINF:10,\nhttps://d13z5uuzt1wkbz.cloudfront.net/${videoId}/HIDDEN4500-${String(i).padStart(5, "0")}.ts\n`
    }

    console.log(data);

    // Load the media for streaming
    hls.loadSource("data:application/x-mpegURL;base64," + btoa(data));
    const awa = "#" + commentary.uuid;
    hls.attachMedia(document.getElementById(awa));
  };

  return (
    <div key={uuid} className="box">
      <div className="box-content">
        <div className="columns is-multiline">
          <div className="column 7">
            <h3 className="title is-5">
              <span style={{ cursor: 'pointer' }} onClick={handleOpenVideoOverlay}>
                {champion} vs {opponent}
              </span>
            </h3>
            <div className="tags">
              <span className="tag is-primary">Content Type: Commentary</span>
              <span className="tag is-primary is-light">Role: {roleToString(role)}</span>
              <span className="tag is-primary is-light" title={releaseDate.toLocaleString()}>
                Released: {releaseDate.toLocaleDateString()}
              </span>
              <span className="tag">Player: {staff}</span>
              <span className="tag">
                K/D/A: {kills}/{deaths}/{assists}
              </span>
              <span className="tag">Game Length: {gameLengthInMinutes} minutes</span>
              <span className="tag">Carry Amount: {carry}</span>
              <span className="tag">Account Type: {type}</span>
            </div>
          </div>
          <div className="column is-5">
            <figure className="image is-16by9">
              <img src={commentary.imageUrl} alt="Video thumbnail" className="thumbnail" />
            </figure>
          </div>
          <div className="column is-12">
            <div className="buttons">
              <button className="button is-small" onClick={handleOpenVideoOverlay}>
                Open Video
              </button>
              <ToggleBookmarkButton {...buttonProps} />
              <ToggleWatchStatusButton {...buttonProps} />
            </div>
          </div>
        </div>
      </div>
      {showVideoOverlay && (
        <div className="video-overlay">
          <button className="button is-small" onClick={stream}>
            Start Video
          </button>
          <video height="720" width="1280" id={"#" + commentary.uuid} controls
            autoPlay />
        </div>)}
    </div>
  );
}
