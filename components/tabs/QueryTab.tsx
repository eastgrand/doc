import ChatInterface from '../ChatInterface';

interface QueryTabProps {
  view: __esri.MapView | null;
}

export default function QueryTab({ view }: QueryTabProps) {
  return (
    <ChatInterface 
      view={view}
      showQueryBuilder={true}
      queryBuilderOnly={true}
    />
  );
} 