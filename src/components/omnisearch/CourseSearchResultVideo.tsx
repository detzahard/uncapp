import { Video } from "../../model/Video";
import { Course } from "../../model/Course";
import React, { useState } from "react";
import { getCourseVideoUrl, getStreamUrl } from "../../utils/UrlUtilities";
import { Bookmarkable } from "../../model/Bookmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faCloudDownloadAlt, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Watchable } from "../../model/WatchStatus";
import classNames from "classnames";
import Hls from "hls.js";


export interface SearchResultVideoProps {
  matchedStrings: string[];
  course: Course;
  video: Video;
  onToggleWatchStatus: (item: Watchable) => void;
  onToggleBookmark: (item: Bookmarkable) => void;
  isWatched: boolean;
  isBookmarked: boolean;
  isDownloadEnabled: boolean;
}

export function CourseSearchResultVideo(props: SearchResultVideoProps): React.ReactElement {
  const { course, video, matchedStrings, isWatched, isBookmarked, isDownloadEnabled } = props;
  // TODO: use alt title from course video
  const { title } = video;

  const link = getCourseVideoUrl(video, course);

  const bookmarkHint = isBookmarked ? "Unbookmark" : "Bookmark";
  const watchToggleIcon = isWatched ? faEyeSlash : faEye;
  const watchToggleHint = isWatched ? "Mark as unwatched" : "Watch as watched";
  const textStyle = isWatched ? "has-text-grey-lighter" : "";

  const [showVideoOverlay, setShowVideoOverlay] = useState(false);

  const handleOpenVideoOverlay = () => {
    setShowVideoOverlay(!showVideoOverlay);
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

    const videoId = video.uuid;

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
    const awa = "#" + video.uuid;
    hls.attachMedia(document.getElementById(awa));
  };

  return (
    <li>
      <span style={{cursor: 'pointer' }} onClick={handleOpenVideoOverlay}>
        {title}
      </span>{""}
      <button
        onClick={() => props.onToggleBookmark(video)}
        className={classNames("video-watched-button tag is-small is-outlined is-inverted is-rounded", {
          "is-warning": isBookmarked,
        })}
        title={bookmarkHint}
      >
        <FontAwesomeIcon icon={faBookmark} />
      </button>
      <button
        onClick={() => props.onToggleWatchStatus(video)}
        className="video-watched-button tag is-small is-outlined is-inverted is-rounded"
        title={watchToggleHint}
      >
        <FontAwesomeIcon icon={watchToggleIcon} />
      </button>
      <button
        onClick={() => handleOpenVideoOverlay()}
        className="video-watched-button tag is-small is-outlined is-inverted is-rounded"
        title="Stream"
      >
        <FontAwesomeIcon icon={faCloudDownloadAlt} />
      </button>

      {showVideoOverlay && (

        <div className="video-overlay">
          <button className="button is-small" onClick={stream}>
            Start Video
          </button>
          {/* Add your VideoOverlay component here */}
          <video height="720" width="1280" id={"#" + video.uuid} controls
            autoPlay />
        </div>
      )}
    </li>

  );
}
