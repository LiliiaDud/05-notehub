import css from "./NoteList.module.css";
import type { Note } from "../../types/note";

export interface NoteListProps {
  notes: Note[];
  onDelete: (id: Note["id"]) => void;
}

export default function NoteList({ notes, onDelete }: NoteListProps) {
  if (!notes.length) return null;

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <button className={css.button} onClick={() => onDelete(note.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
