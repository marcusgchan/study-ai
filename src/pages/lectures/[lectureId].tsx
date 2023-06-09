import { Button, Grid, Loading, Text, Card } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ArrowLeftSquare } from "react-iconly";
import {
  NoteProvider,
  useNoteContext,
} from "~/components/lectures/NoteContextProvider";
import Note from "~/components/lectures/note";
import { api } from "~/utils/api";

const DynamicTranscriptClient = dynamic(
  () => import("~/components/lectures/running/TranscriptNoteEditor"),
  {
    ssr: false,
  }
);

export default function Index() {
  return (
    <NoteProvider>
      <SpecificLecturePage></SpecificLecturePage>
    </NoteProvider>
  );
}

function SpecificLecturePage() {
  const router = useRouter();
  const useNote = useNoteContext();

  const lectureId = router.query.lectureId;

  const navToHome = () => {
    router.push("/lectures");
  };

  const { data: lecture, isLoading: isLoadingLecture } =
    api.example.getLecture.useQuery({
      lectureId: (lectureId as string) ?? "",
    });

  const { data: note, isLoading: isLoadingNote } = api.example.getNote.useQuery(
    {
      lectureId: (lectureId as string) ?? "",
    }
  );

  // useEffect(() => {
  //   console.log("working..?");
  //   if (note || !isLoadingNote) {
  //     console.log("useEffect note");
  //     console.log(note);
  //     const noteContent = note?.content?.toString() || "";
  //     useNote.getEditorSerializedJson(noteContent);
  //   }
  // }, [note]);

  const { data: transcript, isLoading: isLoadingTranscript } =
    api.example.getTranscript.useQuery({
      lectureId: (lectureId as string) ?? "",
    });

  // const content = useNote.getSerializedJson() || "";

  const updateNote = api.example.updateNote.useMutation();

  const updateNoteCallback = () => {
    const content = useNote.getSerializedJson() || "";
    console.log("updatenotecallback called");
    console.log(content);
    updateNote.mutate({
      content: (content as string) ?? "",
      lectureId: (lectureId as string) ?? "",
    });
  };

  const importanceStyler = (importance: number) => {
    if (importance == 0) {
      return "text-white text-opacity-50";
    } else if (importance == 1) {
      return "text-white text-opacity-50";
    } else {
      return "text-white text-opacity-90 font-bold";
    }
  };

  const noteCtx = useNoteContext();
  const words = noteCtx.words;

  // useEffect(() => {
  //   console.log("sfasf");
  //   if (!transcript?.words || !note?.nodeWordMapping) return;
  //   print("dsk;afjds;afjk");
  //   noteCtx.updateWords(JSON.parse(transcript.words));
  //   noteCtx.setWorkKeyToNodeMap(
  //     new Map<string, number>(Object.entries(JSON.parse(note.nodeWordMapping)))
  //   );
  // }, [transcript?.words]);

  if (isLoadingLecture || !lecture) {
    return <Loading />;
  }

  if (isLoadingNote || !note) {
    return <Loading />;
  }

  if (isLoadingTranscript || !transcript) {
    return <Loading />;
  }

  const wordsToIter = JSON.parse(transcript.words);
  console.log(note.nodeWordMapping);
  console.log(JSON.parse(note.nodeWordMapping));
  const nodeToWordMap = new Map<string, number>(
    Object.entries(JSON.parse(note.nodeWordMapping))
  );

  console.log("Map", nodeToWordMap);

  return (
    <main className="flex min-h-screen flex-col items-start justify-start bg-gradient-to-b from-[#3b017d] to-[#151515]">
      <div className="container flex flex-col items-center justify-center gap-2.5 px-4 py-16">
        <div className="flex w-full max-w-full flex-row justify-start pl-10">
          <Button size="md" color="secondary" onClick={navToHome}>
            <div className="flex flex-row items-center gap-2">
              <ArrowLeftSquare
                set="bold"
                primaryColor="white"
              ></ArrowLeftSquare>
              <Text>Back</Text>
            </div>
          </Button>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          {lecture.title}
        </h1>
        <h2 className="text-5xl font-bold tracking-tight text-white sm:text-[2rem]">
          {lecture.topic}
        </h2>
      </div>
      <div className="flex w-full w-screen max-w-full">
        <Grid.Container gap={2} justify="center">
          <Grid xs={5}>
            <div className="flex max-h-[550px] w-full flex-col gap-5">
              <Text h3>Note</Text>
              <Card
                variant="shadow"
                borderWeight="none"
                css={{ height: "550px", padding: "20px" }}
              >
                <div className="overflow-y-auto">
                  {note && <Note isEditable={true} data={note} />}
                </div>
              </Card>
              <div className="w-2/4">
                <Button onClick={updateNoteCallback} color="success">
                  Save
                </Button>
              </div>
            </div>
          </Grid>
          <Grid xs={5}>
            <div className="flex w-full flex-col gap-5">
              <Text h3>Transcription</Text>
              <Card
                variant="shadow"
                borderWeight="none"
                css={{ height: "550px", padding: "20px" }}
              >
                <div className="flex max-h-[550px] flex-1 flex-wrap items-start gap-1 overflow-y-auto">
                  {wordsToIter.length > 0
                    ? wordsToIter.map(({ word, id, importance }, index) => {
                        return (
                          <span
                            key={id}
                            className={`${importanceStyler(importance)}`}
                          >
                            {word}
                          </span>
                        );
                      })
                    : "No transcript yet."}
                </div>
              </Card>
            </div>
          </Grid>
        </Grid.Container>
      </div>
    </main>
  );
}
