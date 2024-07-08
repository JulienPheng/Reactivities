using Microsoft.EntityFrameworkCore;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities
{
     public class List
    {
        public class Query : IRequest<List<Activity>> {}

        public class Handler : IRequestHandler<Query, List<Activity>>
        {
            public readonly DataContext _context;
            public Handler(DataContext context)
            {
            _context = context; 
            }
            public async Task<List<Activity>> Handle(Query request, CancellationToken Token)
            {
                return await _context.Activities.ToListAsync();
            }
        }
    }
}