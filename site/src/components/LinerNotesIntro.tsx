import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface Props {
  text: string;
}

export default function LinerNotesIntro({ text }: Props) {
  if (!text) return null;
  return (
    <div className="mb-6">
      <TextGenerateEffect
        words={text}
        className="text-muted-stone text-base leading-relaxed font-body"
      />
    </div>
  );
}
