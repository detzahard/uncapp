import { roleToString } from "../../model/Role";
import React, { useState } from "react";
import { Video } from "../../model/Video";
import { ToggleWatchStatusButton } from "../ToggleWatchStatusButton";
import { ToggleBookmarkButton } from "../BookmarkToggleButton";
import { Bookmarkable } from "../../model/Bookmark";
import { Watchable } from "../../model/WatchStatus";
import { getStreamUrl, getVideoUrl } from "../../utils/UrlUtilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";
import Hls from "hls.js";


export interface VideoSearchResultProps {
  video: Video;
  isBookmarked: boolean;
  isWatched: boolean;
  onToggleBookmark: (item: Bookmarkable) => void;
  onToggleWatchStatus: (item: Watchable) => void;
  matchedStrings: string[];
  isDownloadEnabled: boolean;
}

export function VideoSearchResult(props: VideoSearchResultProps): React.ReactElement {
  const { video, matchedStrings, isDownloadEnabled } = props;
  const buttonProps = {
    ...props,
    item: video,
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

    let rawUrl = "https://www.skill-capped.com/lol/browse/course/3d5241zcrj/fqr6yn241z";
    rawUrl = rawUrl.replace(/\/[^/]*$/, '');
    let ids = [];
    let match = null;


    while ((match = rgx.exec(rawUrl)) !== null) {
      ids.push(match[1]);
    }

    if (ids.length < 1) {
      console.log("Invalid URL");
      console.log(ids)
      console.log(rawUrl);
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

      const url = `https://d13z5uuzt1wkbz.cloudfront.net/${videoId}/HIDDEN4500-${String(i).padStart(5, "0")}.ts`;
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
    <div key={video.uuid} className="box">
      <div className="box-content">
        <div className="columns is-multiline">
          <div className="column is-7">
            <h3 className="title is-5">
              <span style={{ cursor: 'pointer' }} onClick={handleOpenVideoOverlay}>
                {video.title} {showVideoOverlay ? true : false}
              </span>{""}
            </h3>
            <p>
              {video.description}
            </p>
            <div className="tags">
              <span className="tag is-primary">Content Type: Video</span>
              <span className="tag is-primary is-light">Role: {roleToString(video.role)}</span>
              <span className="tag is-primary is-light" title={video.releaseDate.toLocaleString()}>
                Released: {video.releaseDate.toLocaleDateString()}
              </span>
            </div>
            <div className="buttons">
              <button className="button is-small" onClick={handleOpenVideoOverlay}>
                Open Video
              </button>
              <ToggleBookmarkButton {...buttonProps} />
              <ToggleWatchStatusButton {...buttonProps} />
              {isDownloadEnabled && (
                <a href={getStreamUrl(video)} className="button is-small bookmark">
                  <span className="icon is-small">
                    <FontAwesomeIcon icon={faCloudDownloadAlt} />
                  </span>
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
          <div className="column is-5">
            <figure className="image is-16by9">
              <img src={video.imageUrl} alt="Video thumbnail" className="thumbnail" />
            </figure>
          </div>
        </div>
      </div>
      {showVideoOverlay && (
        <div className="video-overlay">
          <button className="button is-small" onClick={stream}>
            Start Video
          </button>
          <video height="720" width="1280" id={"#" + video.uuid} controls
            autoPlay />
        </div>)}
    </div>
  );
}
