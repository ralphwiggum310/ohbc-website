import React from 'react';

interface SoundCloudWidgetProps {
  playlistId: string;
  height?: number;
  width?: string | number;
  visual?: boolean;
  color?: string;
  autoPlay?: boolean;
  hideRelated?: boolean;
  showComments?: boolean;
  showUser?: boolean;
  showReposts?: boolean;
  showTeaser?: boolean;
  className?: string;
}

const SoundCloudWidget: React.FC<SoundCloudWidgetProps> = ({
  playlistId,
  height = 450,
  width = '100%',
  visual = true,
  color = 'ff5500',
  autoPlay = false,
  hideRelated = true,
  showComments = false,
  showUser = true,
  showReposts = false,
  showTeaser = true,
  className = '',
}) => {
  const src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${playlistId}&color=%23${color}&auto_play=${autoPlay}&hide_related=${hideRelated}&show_comments=${showComments}&show_user=${showUser}&show_reposts=${showReposts}&show_teaser=${showTeaser}&visual=${visual}`;

  return (
    <div className={`soundcloud-widget ${className}`}>
      <iframe
        width={width}
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={src}
        title="SoundCloud Playlist"
        className="w-full"
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        <a
          href={`https://soundcloud.com/ohbcpayson/sets/${playlistId}`}
          title="Open in SoundCloud"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Open in SoundCloud
        </a>
      </div>
    </div>
  );
};

export default SoundCloudWidget;
