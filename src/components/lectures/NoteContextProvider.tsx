import {
  useState,
  useContext,
  createContext,
  useRef,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";

export type NoteContext = {
  words: Word[];
  updateWords: (words: Word[]) => void;
  addWordKeyToNode: (nodeeKey: string) => void;
  shouldHighlight: (index: number) => boolean;
  removeKeywordFromNode: (nodeKey: string) => void;
  setIsListening: (isListening: boolean) => void;
  updateSerializedJson: (serializedJson: string) => void;
  getSerializedJson: () => string;
  getEditorSerializedJson: (serializedJson: string) => void;
  listening: boolean;
};

const NoteContext = createContext<NoteContext>({} as NoteContext);

export function useNoteContext() {
  return useContext(NoteContext);
}

type Word = {
  id: string;
  word: string;
  importance: number;
};

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const serializedJsonRef = useRef<string>("");
  const editorStateRef = useRef<string>("");
  const nodeToWordIndex = useRef(new Map<string, number>());
  const [words, setWords] = useState<Word[]>([]);
  const isListeningRef = useRef(false);

  const updateSerializedJson = (serializedJson: string) => {
    serializedJsonRef.current = serializedJson;
  };

  const getSerializedJson = () => {
    return serializedJsonRef.current || "";
  };

  const getEditorSerializedJson = (serializedJson: string) => {
    editorStateRef.current = serializedJson;
    updateSerializedJson(editorStateRef.current);
  };

  const setIsListening = (isListening: boolean) => {
    isListeningRef.current = isListening;
  };

  const updateWords = useCallback(
    (words: Word[]) => {
      setWords(words);
    },
    [setWords]
  );

  const addWordKeyToNode = (nodeKey: string) => {
    if (!isListeningRef.current) return;

    const lastWord = words.at(-1);
    if (!nodeToWordIndex.current.has(nodeKey) && lastWord !== undefined) {
      nodeToWordIndex.current.set(nodeKey, words.length - 1);
    }
  };

  const shouldHighlight = (index: number) => {
    let temp = false;
    for (const value of nodeToWordIndex.current.values()) {
      if (value === index) {
        temp = true;
        break;
      }
    }
    return temp;
  };

  const removeKeywordFromNode = (nodeKey: string) => {
    console.log("removing node", nodeKey);
    setWords(
      words.map((word) => {
        if (word.id === nodeKey) {
          return { ...word, key: uuidv4() };
        }
        return word;
      })
    );
    nodeToWordIndex.current.delete(nodeKey);
  };

  return (
    <NoteContext.Provider
      value={{
        words,
        updateWords,
        addWordKeyToNode,
        shouldHighlight,
        removeKeywordFromNode,
        setIsListening,
        updateSerializedJson,
        getSerializedJson,
        getEditorSerializedJson,
        listening: isListeningRef.current,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}
