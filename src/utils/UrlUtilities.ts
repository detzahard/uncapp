import { Course } from "../model/Course";
import { Video } from "../model/Video";
import { Commentary } from "../model/Commentary";

const BASE_URL = "https://www.skill-capped.com/lol/";
const BROWSE_URL = BASE_URL + "browse";

export function rawTitleToUrlTitle(rawTitle: string): string {
  return rawTitle
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/\$/g, "")
    .replace(/[!:.'%,[\]]/g, "");
}

export function getVideoUrl(video: Video): string {
  return BROWSE_URL + "/video/" + video.uuid;
}

export function getCourseVideoUrl(video: Video, course: Course): string {
  return BROWSE_URL + "/course/" + video.uuid + "/" + course.uuid;
}

export function getCommentaryUrl(commentary: Commentary): string {
  return BASE_URL + "commentaries/" + commentary.uuid;
}

export function getStreamUrl(video: Video | Commentary): string {
  return `https://www.skill-capped.com/lol/api/new/video/${video.uuid}/4500.m3u8`;
}

// CORS proxy used to bypass cross-origin restrictions for CloudFront-hosted segments
// CORS proxy used to bypass cross-origin restrictions for CloudFront-hosted segments.
// We allow toggling the proxy at runtime via localStorage, so exposed as a getter and setter.
const DEFAULT_CORS_PROXY = "https://corsproxy.io/";

export function isCorsProxyEnabled(): boolean {
  try {
    const v = localStorage.getItem("corsproxy.enabled");
    if (v === null) return true; // default on
    return v === "true";
  } catch (e) {
    return true;
  }
}

export function setCorsProxyEnabled(enabled: boolean) {
  try {
    localStorage.setItem("corsproxy.enabled", enabled ? "true" : "false");
  } catch (e) {
    // ignore
  }
}

export function getCorsProxy(): string {
  return isCorsProxyEnabled() ? DEFAULT_CORS_PROXY : "";
}
