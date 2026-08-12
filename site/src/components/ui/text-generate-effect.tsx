import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const prefersReducedMotion = useReducedMotion();
  // Start the reveal when the text actually enters the viewport — it used
  // to fire on mount, so for below-the-fold copy the whole cascade played
  // invisibly before the reader ever scrolled to it.
  const isInView = useInView(scope, { once: true, margin: "-15% 0px" });
  let wordsArray = words.split(" ");

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    );
  }, [isInView, prefersReducedMotion]);

  // Reduced motion: plain, fully-visible text. Reading is the feature.
  if (prefersReducedMotion) {
    return (
      <div className={cn("font-bold", className)}>
        <div className="mt-4">
          <div className="text-2xl leading-snug tracking-wide">{words}</div>
        </div>
      </div>
    );
  }

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-2xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
