import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { usePlayer } from '../../hooks/usePlayer';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import playingImg from '../../../public/playing.svg';
import shuffleImg from '../../../public/shuffle.svg';
import playPreviousImg from '../../../public/play-previous.svg';
import playImg from '../../../public/play.svg';
import pauseImg from '../../../public/pause.svg';
import playNextImg from '../../../public/play-next.svg';
import repeatImg from '../../../public/repeat.svg';

import styles from './styles.module.scss';

export function Player() {
  const [ progress, setProgress ] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const { episodeList, currentEpisodeIndex, isPlaying, isLooping, isShuffling, playNext, playPrevious, togglePlay, toggleLoop, toggleShuffle, setPlayingState, clearPlayerState, hasNext, hasPrevious } = usePlayer();

  useEffect(() => {
    if(!audioRef.current)
      return;
    
    if(isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if(hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <Image src={playingImg} alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image 
            width={592}
            height={592}
            src={episode.thumbnail} 
            alt={episode.title} 
            objectFit="cover"
          />

          <strong>{episode.title}</strong>

          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      ) }

      <footer className={ !episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>

          <div className={styles.slider}>
            {episode ? (
              <Slider 
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
              ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        { episode && (
          <audio 
            ref={audioRef}
            src={episode.url} 
            loop={isLooping}
            autoPlay
            onEnded={handleEpisodeEnded}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button 
            type="button" 
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <Image src={shuffleImg} alt="Embaralhar" />
          </button>

          <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <Image src={playPreviousImg} alt="Tocar anterior" />
          </button>

          <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
            { isPlaying ? (
              <Image src={pauseImg} alt="Pausar" />
            ) : (
              <Image src={playImg} alt="Tocar" />
            )}
          </button>

          <button type="button" disabled={!episode || !hasNext} onClick={playNext}>
            <Image src={playNextImg} alt="Tocar próxima" />
          </button>

          <button 
            type="button" 
            disabled={!episode} 
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <Image src={repeatImg} alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}