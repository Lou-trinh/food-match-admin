import { useEffect, useRef, useState } from 'react';
import { ordersApi, imgUrl } from '../api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&q=60';

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);

  async function fetchOrders() {
    try {
      const res = await ordersApi.getAll();
      setOrders(res.data);
      setUnread(res.data.filter(o => !o.isRead).length);
    } catch {
      // ignore if not logged in yet
    }
  }

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleOpen() {
    setOpen(v => !v);
    if (!open) await fetchOrders();
  }

  async function handleMarkRead(order) {
    if (order.isRead) return;
    try {
      await ordersApi.markRead(order._id);
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isRead: true } : o));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await ordersApi.remove(id);
      setOrders(prev => {
        const next = prev.filter(o => o._id !== id);
        setUnread(next.filter(o => !o.isRead).length);
        return next;
      });
    } catch {}
  }

  return (
    <div className="notif-bell" ref={panelRef}>
      <button className="notif-bell__btn" onClick={handleOpen} aria-label="Thông báo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className="notif-bell__badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel__header">
            <strong>Thông báo</strong>
            {unread > 0 && <span className="notif-panel__unread">{unread} chưa đọc</span>}
          </div>

          {orders.length === 0 ? (
            <div className="notif-panel__empty">Chưa có đơn nào</div>
          ) : (
            <div className="notif-panel__list">
              {orders.map(order => (
                <div
                  key={order._id}
                  className={`notif-item${order.isRead ? '' : ' is-unread'}`}
                  onClick={() => handleMarkRead(order)}
                >
                  <div className="notif-item__imgs">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={imgUrl(item.image) || FALLBACK}
                        alt={item.name}
                        onError={e => { e.currentTarget.src = FALLBACK; }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="notif-item__more">+{order.items.length - 3}</span>
                    )}
                  </div>
                  <div className="notif-item__body">
                    <p className="notif-item__title">
                      {order.items.length} món: {order.items.slice(0, 2).map(i => i.name).join(', ')}
                      {order.items.length > 2 ? '...' : ''}
                    </p>
                    <span className="notif-item__time">{timeAgo(order.createdAt)}</span>
                  </div>
                  {!order.isRead && <span className="notif-item__dot" />}
                  <button className="notif-item__del" onClick={e => handleDelete(order._id, e)} aria-label="Xóa">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
