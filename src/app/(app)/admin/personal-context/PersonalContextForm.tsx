"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePersonalContext } from "./actions";

type PersonalContext = {
  partnerName: string;
  nicknames: string[];
  insideJokes: string[];
  cheerUpList: string[];
  favorites: Record<string, string[]>;
  avoidTopics: string[];
  tone: string;
  language: string;
  relationshipStartDate: string;
  partnerBirthday: string;
  adminName: string;
};

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function favoritesToText(favorites: Record<string, string[]>): string {
  return Object.entries(favorites)
    .map(([category, items]) => `${category}: ${items.join(", ")}`)
    .join("\n");
}

function textToFavorites(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const category = line.slice(0, idx).trim();
    const items = line
      .slice(idx + 1)
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    if (category && items.length > 0) result[category] = items;
  }
  return result;
}

export function PersonalContextForm({ initial }: { initial: PersonalContext }) {
  const router = useRouter();
  const [partnerName, setPartnerName] = useState(initial.partnerName);
  const [adminName, setAdminName] = useState(initial.adminName);
  const [nicknames, setNicknames] = useState(initial.nicknames.join("\n"));
  const [insideJokes, setInsideJokes] = useState(initial.insideJokes.join("\n"));
  const [cheerUpList, setCheerUpList] = useState(initial.cheerUpList.join("\n"));
  const [avoidTopics, setAvoidTopics] = useState(initial.avoidTopics.join("\n"));
  const [favoritesText, setFavoritesText] = useState(favoritesToText(initial.favorites));
  const [tone, setTone] = useState(initial.tone);
  const [language, setLanguage] = useState(initial.language);
  const [relationshipStartDate, setRelationshipStartDate] = useState(initial.relationshipStartDate);
  const [partnerBirthday, setPartnerBirthday] = useState(initial.partnerBirthday);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePersonalContext({
        partnerName,
        adminName,
        nicknames: linesToList(nicknames),
        insideJokes: linesToList(insideJokes),
        cheerUpList: linesToList(cheerUpList),
        avoidTopics: linesToList(avoidTopics),
        favorites: textToFavorites(favoritesText),
        tone,
        language,
        relationshipStartDate,
        partnerBirthday,
      });
      router.refresh();
      toast.success("Saved");
    } catch {
      toast.error("Couldn't save — check the dates are valid");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="partnerName">Her name</Label>
          <Input id="partnerName" className="text-base" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} required />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="adminName">Your name</Label>
          <Input id="adminName" className="text-base" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="relationshipStartDate">Met on</Label>
          <Input
            id="relationshipStartDate"
            type="date"
            className="text-base"
            value={relationshipStartDate}
            onChange={(e) => setRelationshipStartDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="partnerBirthday">Her birthday</Label>
          <Input
            id="partnerBirthday"
            type="date"
            className="text-base"
            value={partnerBirthday}
            onChange={(e) => setPartnerBirthday(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nicknames">Nicknames (one per line)</Label>
        <Textarea id="nicknames" className="text-base" rows={2} value={nicknames} onChange={(e) => setNicknames(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="insideJokes">Inside jokes (one per line)</Label>
        <Textarea id="insideJokes" className="text-base" rows={3} value={insideJokes} onChange={(e) => setInsideJokes(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cheerUpList">Things that cheer her up (one per line)</Label>
        <Textarea id="cheerUpList" className="text-base" rows={3} value={cheerUpList} onChange={(e) => setCheerUpList(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="favorites">Favorites (one category per line: &ldquo;Movies: A, B&rdquo;)</Label>
        <Textarea id="favorites" className="text-base" rows={3} value={favoritesText} onChange={(e) => setFavoritesText(e.target.value)} placeholder="Movies: Inception, Amelie&#10;Food: Biryani, sushi" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="avoidTopics">Topics to avoid (one per line)</Label>
        <Textarea id="avoidTopics" className="text-base" rows={2} value={avoidTopics} onChange={(e) => setAvoidTopics(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="tone">Tone</Label>
          <Input id="tone" className="text-base" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="warm, playful" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="language">Language style</Label>
          <Input id="language" className="text-base" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="English + casual Urdu" />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
