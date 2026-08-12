import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResultPage from './ResultPage';

export default function SharePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      navigate(`/result?id=${id}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [id, navigate]);

  return <ResultPage />;
}
