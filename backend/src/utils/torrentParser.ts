import { ParsedTorrent } from '../types/torrent.js';

const REGEXES = {
  resolutions: {
    "2160p": /(4k|2160(p|i)?)|ultra[\s\._-]?hd|3840x\d+/i,
    "1080p": /(1080(p|i)?)|full[\s\._-]?hd|1920x\d+/i,
    "720p": /(720(p|i)?)|hd|1280x\d+/i,
    "480p": /(480(p|i)?)|sd/i,
  },
  qualities: {
    "BluRay REMUX": /remux/i,
    "BluRay": /(blu[\s\._-]?ray|bd[.\s\-_]?rip)/i,
    "WEB-DL": /web[\s\._-]?dl(?![\s\._-]?rip)/i,
    "WEBRip": /web[\s\._-]?rip/i,
    "HDRip": /hd[\s\._-]?rip|web[\s\._-]?dl[\s\._-]?rip/i,
    "DVDRip": /dvd[\s\._-]?rip/i,
    "HDTV": /(hd|pd)tv|tv[\s\._-]?rip/i,
    "CAM": /cam|hdcam|cam[\s\._-]?rip/i,
    "TS": /telesync|ts|hd[\s\._-]?ts/i,
    "TC": /telecine|tc|hd[\s\._-]?tc/i,
  },
  encodes: {
    "HEVC": /(hevc|[xh][\s\._-]?265)/i,
    "AVC": /(avc|[xh][\s\._-]?264)/i,
    "AV1": /av1/i,
    "XviD": /xvid/i,
    "DivX": /divx/i,
  },
  audioTags: {
    "Atmos": /atmos/i,
    "DD+": /dd[\s\._-]?\+|dolby[\s\._-]?digital[\s\._-]?plus|eac3/i,
    "DD": /dd(?!\+)|ac3|dolby[\s\._-]?digital/i,
    "DTS": /dts(?![\s\._-]?hd|[\s\._-]?ma)/i,
    "DTS-HD MA": /dts[\s\._-]?hd[\s\._-]?ma/i,
    "TrueHD": /true[\s\._-]?hd/i,
    "AAC": /aac/i,
    "FLAC": /flac/i,
  },
  audioChannels: {
    "2.0": /2[\s\._-]0/i,
    "5.1": /5[\s\._-]1/i,
    "7.1": /7[\s\._-]1/i,
  },
  languages: {
    "Dual Audio": /dual[\s\._-]?audio/i,
    "English": /english|eng/i,
    "French": /french|fre|fr/i,
    "German": /german|ger|de/i,
    "Spanish": /spanish|spa|es/i,
    "Italian": /italian|ita/i,
  },
  visualTags: {
    "HDR10+": /hdr[\s\._-]?10[\s\._-]?(plus|\+)/i,
    "HDR10": /hdr[\s\._-]?10/i,
    "HDR": /hdr(?![\s\._-]?10)/i,
    "DV": /dolby[\s\._-]?vision|dv/i,
    "10bit": /10[\s\._-]?bit/i,
  },
  releaseGroup: /(?:-| )(?!\d+$|S\d+|\d+x|ep?\d+)([^\-. \[\()]+)(?=(?:\.[a-z]{2,4})?$|$)/i,
};

function matchSingle(filename: string, patterns: Record<string, RegExp>): string | undefined {
  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern.test(filename)) {
      return key;
    }
  }
  return undefined;
}

function matchMultiple(filename: string, patterns: Record<string, RegExp>): string[] {
  return Object.entries(patterns)
    .filter(([_, pattern]) => pattern.test(filename))
    .map(([key, _]) => key);
}

export function parseTorrentFilename(filename: string): ParsedTorrent {
  const result: ParsedTorrent = {};
  let fname = filename.replace(/\.[a-zA-Z0-9]{2,4}$/, "");

  const rg_match = REGEXES.releaseGroup.exec(fname);
  result.releaseGroup = rg_match ? rg_match[1] : undefined;
  
  if (rg_match) {
    fname = fname.slice(0, rg_match.index);
  }

  const title_regex = /^(.*?)((19|20)\d{2}|S\d{2}|E\d{2}|x\d{2}|720p|1080p|2160p|BluRay|WEB|HDR|DVDrip|HDTV)/i;
  const title_match = title_regex.exec(fname);
  result.title = title_match
    ? title_match[1].replace(/[._]/g, " ").trim()
    : undefined;

  result.resolution = matchSingle(fname, REGEXES.resolutions) as ParsedTorrent['resolution'];
  result.quality = matchSingle(fname, REGEXES.qualities) as ParsedTorrent['quality'];
  result.encode = matchSingle(fname, REGEXES.encodes) as ParsedTorrent['encode'];
  result.audioTags = matchMultiple(fname, REGEXES.audioTags);
  result.audioChannels = matchMultiple(fname, REGEXES.audioChannels);
  result.languages = matchMultiple(fname, REGEXES.languages);
  result.visualTags = matchMultiple(fname, REGEXES.visualTags) as ParsedTorrent['visualTags'];

  const year_match = /((19|20)\d{2})/i.exec(fname);
  result.year = year_match ? parseInt(year_match[1], 10) : undefined;

  return result;
}