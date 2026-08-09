import { useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getDb, getFirebaseStorage } from "@/lib/firebase";
import { useMediaLibrary } from "@/hooks/useCms";

export function AdminMediaPage() {
  const { media, loading, reload } = useMediaLibrary();
  const [alt, setAlt] = useState("");
  const [usedAs, setUsedAs] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;
    const db = getDb();
    const storage = getFirebaseStorage();
    if (!db || !storage) return;

    setUploading(true);
    setMessage(null);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const publicUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "media"), {
        storagePath: path,
        publicUrl,
        alt: alt || file.name,
        usedAs: usedAs || null,
        createdAt: new Date().toISOString(),
      });
      setAlt("");
      setUsedAs("");
      form.reset();
      setMessage("Uploaded.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  }

  async function remove(id: string, storagePath: string) {
    if (!confirm("Delete this media asset?")) return;
    const db = getDb();
    const storage = getFirebaseStorage();
    if (!db || !storage) return;
    try {
      await deleteObject(ref(storage, storagePath));
      await deleteDoc(doc(db, "media", id));
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function copyPath(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage("Copied URL.");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Media</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Upload images to Firebase Storage. Paste the public URL into settings or a service card
        image field.
      </p>

      <form onSubmit={onUpload} className="mt-6 max-w-lg space-y-3 border border-line bg-paper p-4">
        <label className="block text-sm font-medium">
          File
          <input name="file" type="file" accept="image/*" required className="mt-1 block w-full text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Alt text
          <input
            className="mt-1 w-full border border-line bg-cream px-3 py-2"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Used as (optional)
          <input
            className="mt-1 w-full border border-line bg-cream px-3 py-2"
            placeholder="hero, service_card, …"
            value={usedAs}
            onChange={(e) => setUsedAs(e.target.value)}
          />
        </label>
        <button type="submit" disabled={uploading} className="btn-mustard disabled:opacity-60">
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {message ? <p className="text-sm text-leaf">{message}</p> : null}
      </form>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading library…</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <figure key={item.id} className="border border-line bg-paper p-3">
              <img
                src={item.publicUrl}
                alt={item.alt}
                className="aspect-video w-full object-cover bg-cream"
              />
              <figcaption className="mt-2 text-xs text-ink-soft">
                <p className="font-medium text-ink">{item.alt}</p>
                {item.usedAs ? <p>Used as: {item.usedAs}</p> : null}
                <p className="mt-1 truncate" title={item.publicUrl}>
                  {item.publicUrl}
                </p>
              </figcaption>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="border border-line bg-cream px-2 py-1 text-xs"
                  onClick={() => void copyPath(item.publicUrl)}
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  className="border border-line px-2 py-1 text-xs text-pink"
                  onClick={() => void remove(item.id, item.storagePath)}
                >
                  Delete
                </button>
              </div>
            </figure>
          ))}
          {!media.length ? (
            <p className="text-sm text-muted sm:col-span-2">No uploads yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
