import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { foodsApi, drinksApi, imgUrl } from '../api';
import Layout from '../components/Layout';

const FOOD_TAGS = ['Sáng / Ăn nhẹ', 'Trưa / Tối', 'Sáng / Trưa / Tối', 'Ăn vặt', 'Lẩu / Nướng'];
const DRINK_TAGS = ['Cà phê Việt', 'Cà phê máy', 'Trà', 'Nước ép', 'Sữa chua', 'Matcha', 'Sinh tố'];

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const EMPTY = {
  id: '', name: '', tag: '', price: '', calories: '',
  time: '', rating: '4.5', description: '', ingredients: [],
};

export default function ItemForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isFoods = location.pathname.startsWith('/foods');
  const api = isFoods ? foodsApi : drinksApi;
  const tags = isFoods ? FOOD_TAGS : DRINK_TAGS;
  const base = isFoods ? 'foods' : 'drinks';
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [ingredientInput, setIngredientInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    api.getOne(id).then(res => {
      const d = res.data;
      setForm({
        id: d.id, name: d.name, tag: d.tag,
        price: d.price, calories: d.calories,
        time: d.time, rating: d.rating,
        description: d.description || '',
        ingredients: d.ingredients || [],
      });
      if (d.image) setImagePreview(imgUrl(d.image));
    }).catch(() => navigate(`/${base}`));
  }, [id]);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function handleNameChange(e) {
    const name = e.target.value;
    setForm(f => ({ ...f, name, id: isEdit ? f.id : toSlug(name) }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addIngredient(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = ingredientInput.trim().replace(/,$/, '');
      if (val && !form.ingredients.includes(val)) {
        setForm(f => ({ ...f, ingredients: [...f.ingredients, val] }));
      }
      setIngredientInput('');
    }
  }

  function removeIngredient(i) {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'ingredients') data.append(k, JSON.stringify(v));
        else data.append(k, v);
      });
      if (imageFile) data.append('image', imageFile);

      if (isEdit) await api.update(id, data);
      else await api.create(data);

      navigate(`/${base}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  const title = isEdit ? `Sửa ${isFoods ? 'món ăn' : 'đồ uống'}` : `Thêm ${isFoods ? 'món ăn' : 'đồ uống'}`;

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div className="page-back-row">
            <button className="btn-back" onClick={() => navigate(`/${base}`)}>← Quay lại</button>
            <h1 className="page-title">{title}</h1>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Left column */}
            <div className="card form-card">
              <h2 className="form-section-title">Thông tin cơ bản</h2>

              <div className="field">
                <label>Tên <span className="required">*</span></label>
                <input type="text" value={form.name} onChange={handleNameChange} required placeholder="Phở bò" />
              </div>

              <div className="field">
                <label>ID (slug)</label>
                <input type="text" value={form.id} onChange={set('id')} required placeholder="pho-bo"
                  pattern="[a-z0-9-]+" title="Chỉ chữ thường, số và dấu gạch ngang" />
                <span className="field-hint">Tự động tạo từ tên, dùng để đặt tên file ảnh</span>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Danh mục <span className="required">*</span></label>
                  <input list={`tags-${base}`} value={form.tag} onChange={set('tag')} required placeholder="Chọn hoặc nhập..." />
                  <datalist id={`tags-${base}`}>
                    {tags.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
                <div className="field">
                  <label>Thời gian</label>
                  <input type="text" value={form.time} onChange={set('time')} placeholder="10 phút" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Giá (VND) <span className="required">*</span></label>
                  <input type="number" value={form.price} onChange={set('price')} required min="0" placeholder="65000" />
                </div>
                <div className="field">
                  <label>Calories</label>
                  <input type="number" value={form.calories} onChange={set('calories')} min="0" placeholder="350" />
                </div>
                <div className="field">
                  <label>Đánh giá</label>
                  <input type="number" value={form.rating} onChange={set('rating')} min="0" max="5" step="0.1" placeholder="4.5" />
                </div>
              </div>

              <div className="field">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Mô tả ngắn về món..." />
              </div>
            </div>

            {/* Right column */}
            <div className="form-right">
              <div className="card form-card">
                <h2 className="form-section-title">Hình ảnh</h2>
                <div
                  className={`image-upload-zone${imagePreview ? ' has-image' : ''}`}
                  onClick={() => fileRef.current.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="image-preview" />
                    : <div className="image-upload-placeholder">
                        <span>📷</span>
                        <p>Click để chọn ảnh</p>
                        <small>JPG, PNG — tối đa 5MB</small>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
                {imagePreview && (
                  <button type="button" className="btn btn-sm btn-outline mt-8"
                    onClick={() => { setImageFile(null); setImagePreview(''); fileRef.current.value = ''; }}>
                    Xóa ảnh
                  </button>
                )}
              </div>

              <div className="card form-card">
                <h2 className="form-section-title">Nguyên liệu</h2>
                <div className="ingredients-wrap">
                  {form.ingredients.map((ing, i) => (
                    <span key={i} className="ingredient-chip">
                      {ing}
                      <button type="button" onClick={() => removeIngredient(i)}>×</button>
                    </span>
                  ))}
                  <input
                    className="ingredient-input"
                    type="text"
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={addIngredient}
                    placeholder="Nhập rồi Enter để thêm..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/${base}`)}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
