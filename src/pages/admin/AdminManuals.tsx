import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, RotateCcw, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  useManuals,
  upsertManual,
  deleteManual,
  resetManuals,
  Manual,
} from "@/data/manualsStore";

const empty: Manual = {
  id: "",
  brand: "",
  model: "",
  boardModel: "",
  pdfUrl: "",
  price: 0,
  isPremium: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminManuals() {
  const manuals = useManuals();
  const [form, setForm] = useState<Manual>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const reset = () => {
    setForm(empty);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.pdfUrl) {
      toast.error("Brand, Model, and PDF URL are required.");
      return;
    }
    const id =
      editing ??
      `${slugify(form.brand)}-${slugify(form.model)}-${Date.now().toString(36)}`;
    upsertManual({ ...form, id, price: Number(form.price) || 0 });
    toast.success(editing ? "Manual updated" : "Manual added");
    reset();
  };

  const startEdit = (m: Manual) => {
    setForm(m);
    setEditing(m.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this manual?")) return;
    deleteManual(id);
    if (editing === id) reset();
    toast.success("Deleted");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Manage Sewing Machine Manuals
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, edit or remove PDF manuals shown on the homepage.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Reset to default seed manuals?")) {
              resetManuals();
              toast.success("Reset to defaults");
            }
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Form */}
      <Card className="p-5">
        <h2 className="font-semibold mb-4">
          {editing ? "Edit Manual" : "Add New Manual"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <Label>Brand Name *</Label>
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. Juki"
            />
          </div>
          <div>
            <Label>Machine Model *</Label>
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="e.g. DDL-8700"
            />
          </div>
          <div>
            <Label>Board Model</Label>
            <Input
              value={form.boardModel}
              onChange={(e) =>
                setForm({ ...form, boardModel: e.target.value })
              }
              placeholder="e.g. SC-921"
            />
          </div>
          <div>
            <Label>Price (৳) — 0 = Free</Label>
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>PDF URL (Google Drive / Public link) *</Label>
            <Input
              value={form.pdfUrl}
              onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              {editing ? "Update Manual" : "Add Manual"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={reset}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Brand</th>
                <th className="p-3">Model</th>
                <th className="p-3">Board</th>
                <th className="p-3">Price</th>
                <th className="p-3">PDF</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manuals.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No manuals yet.
                  </td>
                </tr>
              )}
              {manuals.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 font-medium">{m.brand}</td>
                  <td className="p-3">{m.model}</td>
                  <td className="p-3 text-muted-foreground">{m.boardModel}</td>
                  <td className="p-3">
                    {m.price > 0 ? (
                      <Badge>৳{m.price}</Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <a
                      href={m.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline truncate max-w-[220px] inline-block"
                    >
                      {m.pdfUrl}
                    </a>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(m)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
