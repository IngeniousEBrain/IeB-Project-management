from django_filters import FilterSet, AllValuesFilter
from django_filters import DateTimeFilter, DateFilter

from .models import Project

class ProjectFilter(FilterSet):
	from_date = DateFilter(field_name='created_at__date',
											lookup_expr='gte')
	to_date = DateFilter(field_name='created_at__date',
										lookup_expr='lte')
	business_unit = AllValuesFilter(field_name='business_unit')

	class Meta:
		model = Project
		fields = (
			'from_date',
			'to_date',
			'business_unit'
			)
