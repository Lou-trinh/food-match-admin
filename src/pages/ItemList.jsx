import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodsApi, drinksApi, imgUrl } from '../api';
import Layout from '../components/Layout';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&q=60';

export default function ItemList({ type }) {
  const isFoods = type === 'food';
  const api = isFoods ? foodsApi : drinksApi;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAll(search ? { q: search } : {});
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(item) {
    if (!window.confirm(`Xóa "${item.name}"?`)) return;
    setDeleting(item.id);
    try {
      await api.remove(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  }

  const base = isFoods ? 'foods' : 'drinks';
  const title = isFoods ? 'Đồ ăn' : 'Đồ uống';

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-sub">{items.length} mục</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate(`/${base}/new`)}>
            + Thêm mới
          </button>
        </div>

        <div className="card">
          <div className="table-toolbar">
            <input
              className="search-input"
              type="text"
              placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="table-empty">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="table-empty">Không có dữ liệu</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width: '48px'}}>STT</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Đánh giá</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="row-num">{idx + 1}</td>
                      <td>
                        <img
                          className="table-thumb"
                          src={imgUrl(item.image) || FALLBACK}
                          alt={item.name}
                          onError={e => { e.currentTarget.src = FALLBACK; }}
                        />
                      </td>
                      <td>
                        <strong className="item-name">{item.name}</strong>
                        <span className="item-id">{item.id}</span>
                      </td>
                      <td><span className="tag-chip">{item.tag}</span></td>
                      <td className="price">{Number(item.price).toLocaleString('vi-VN')}đ</td>
                      <td>
                        <span className="rating">⭐ {item.rating}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/${base}/${item.id}/edit`)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item)}
                            disabled={deleting === item.id}
                          >
                            {deleting === item.id ? '...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
