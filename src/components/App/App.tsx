import css from "./App.module.css";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { fetchNotes, createNote, deleteNote } from "../../services/noteService";
import type { Note } from "../../types/note";
import type { CreateNotePayload } from "../../services/noteService";

import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";

export default function App() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, perPage, debouncedSearch],
    queryFn: () => fetchNotes({ page, perPage, search: debouncedSearch }),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
      // Якщо видалити кеш тільки поточної сторінки, то останній елемент на ній зникне на бекенді
      // (перейде на наступну сторінку) але не зʼявиться на UI, бо кеш не оновився.
      // Можна переносити останній елемент в черзі, але простіше просто інвалідити весь кеш.
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Note["id"]) => deleteNote(id),
    onSuccess: () => {
      // Якщо видалити кеш тільки сторінки з елементом, то на ній буде
      // перший елемент з наступної кешованої сторінки
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p className={css.info}>Loading notes, please wait...</p>}
      {isError && (
        <p className={css.error}>There was an error, please try again...</p>
      )}

      {data && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={(payload) => createMutation.mutate(payload)}
            submitting={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
