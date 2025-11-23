import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Note, NoteTag } from "../types/note";

const BASE_URL = "https://notehub-public.goit.study/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  tag: NoteTag;
}

export async function fetchNotes({
  page = 1,
  perPage = 12,
  search = "",
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response: AxiosResponse<FetchNotesResponse> = await client.get(
    "/notes",
    {
      params: { page, perPage, search: search || undefined },
    }
  );

  return response.data;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const response: AxiosResponse<Note> = await client.post("/notes", payload);
  return response.data;
}

export async function deleteNote(id: Note["id"]): Promise<Note> {
  const response: AxiosResponse<Note> = await client.delete(`/notes/${id}`);
  return response.data;
}
