import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchResources, addResource, updateResource, deleteResource } from '../../store/slices/resourcesSlice';
import { Sidebar } from '../../components/Sidebar';
import { Modal } from '../../components/Modal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DigitalResource } from '../../types';
import { Plus, Globe, Edit2, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { resources, loading, error } = useAppSelector((state) => state.resources);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<DigitalResource | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [resourceUrl, setResourceUrl] = useState('');
  const [accessType, setAccessType] = useState<'Open Access' | 'Institutional' | 'PDF Download' | 'Video Lecture'>('Institutional');

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Computer Science');
    setResourceUrl('');
    setAccessType('Institutional');
    setEditingResource(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: DigitalResource) => {
    setEditingResource(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setCategory(item.category);
    setResourceUrl(item.resourceUrl);
    setAccessType(item.accessType);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    const payload = { title, description, category, resourceUrl, accessType };

    if (editingResource) {
      const res = await dispatch(updateResource({ id: editingResource._id, resourceData: payload }));
      if (updateResource.fulfilled.match(res)) {
        setSuccessMsg('Digital resource updated successfully');
        setIsModalOpen(false);
        resetForm();
      }
    } else {
      const res = await dispatch(addResource(payload));
      if (addResource.fulfilled.match(res)) {
        setSuccessMsg('Digital resource created successfully');
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (item: DigitalResource) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const res = await dispatch(deleteResource(item._id));
    if (deleteResource.fulfilled.match(res)) {
      setSuccessMsg('Digital resource removed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Digital Resource Repository CRUD</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage institutional journals, research portals, and e-learning media</p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Digital Resource</span>
          </button>
        </div>

        <ErrorMessage message={error || ''} />

        {successMsg && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No resources found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Resource Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Access Type</th>
                  <th className="px-4 py-3">URL Link</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md">{item.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{item.accessType}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-blue-600 underline truncate max-w-xs">
                      <a href={item.resourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                        <span>{item.resourceUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingResource ? 'Edit Digital Resource' : 'Add New Digital Resource'}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ACM Digital Library Journal Archive"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Type *</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value="Institutional">Institutional</option>
                  <option value="Open Access">Open Access</option>
                  <option value="PDF Download">PDF Download</option>
                  <option value="Video Lecture">Video Lecture</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resource URL Link *</label>
              <input
                type="url"
                required
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://dl.acm.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Access details and scope..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingResource ? 'Update Resource' : 'Save Resource'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
