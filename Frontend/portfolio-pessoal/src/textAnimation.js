import React, { useState, useEffect } from "react";

const TypingAnimation = ({
  words,
  speed = 100,
  eraseSpeed = 50,
  delay = 1000,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const currentWord = words[currentWordIndex];
    const timer = setInterval(() => {
      setDisplayedText((prevText) => {
        if (isDeleting) {
          const updatedText = prevText.slice(0, -1);
          if (updatedText === "") {
            setIsDeleting(false);
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
          }
          return updatedText;
        } else {
          const updatedText = currentWord.slice(0, prevText.length + 1);
          if (updatedText === currentWord) {
            clearInterval(timer);
            setTimeout(() => {
              setIsDeleting(true);
            }, delay);
          }
          return updatedText;
        }
      });
    }, isDeleting ? eraseSpeed : speed);

    return () => clearInterval(timer);
  }, [words, currentWordIndex, isDeleting, speed, eraseSpeed, delay]);

  return <span>{displayedText}</span>;
};

export default TypingAnimation;
